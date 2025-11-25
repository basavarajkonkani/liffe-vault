import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as authService from '../services/auth.service';
import { supabase } from '../config/supabase';
import { env } from '../config/env';
import { SendOTPRequest, VerifyOTPRequest, SetPINRequest, LoginPINRequest } from '../schemas/auth.schema';

/**
 * Send OTP to user's email
 * POST /auth/send-otp
 */
export const sendOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body as SendOTPRequest;

    const result = await authService.sendOTP(email);

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.error || result.message,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('Error in sendOTP controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send OTP',
    });
  }
};

/**
 * Verify OTP and return temporary token
 * POST /auth/verify-otp
 */
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body as VerifyOTPRequest;

    const result = await authService.verifyOTP(email, otp);

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.error || result.message,
      });
      return;
    }

    // Generate a temporary token valid for 10 minutes for PIN setup
    const tempToken = jwt.sign(
      {
        userId: result.userId,
        email: result.email,
        temp: true,
      },
      env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        userId: result.userId,
        email: result.email,
        tempToken,
      },
    });
  } catch (error) {
    console.error('Error in verifyOTP controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify OTP',
    });
  }
};

/**
 * Set PIN for user and store with role in database
 * POST /auth/set-pin
 */
export const setPIN = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, pin, role } = req.body as SetPINRequest;

    // Get user email from Supabase Auth
    const userResult = await authService.getUserById(userId);
    if (!userResult.success || !userResult.user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    // Hash PIN with bcrypt (cost factor 10)
    const pinHash = await bcrypt.hash(pin, 10);

    // Store user data in users table with hashed PIN and role
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: userResult.user.email,
        role,
        pin_hash: pinHash,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error storing user in database:', error);
      
      // Check if user already exists
      if (error.code === '23505') {
        res.status(400).json({
          success: false,
          error: 'User already exists. Please login instead.',
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Failed to set PIN',
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'PIN set successfully',
      data: {
        userId: data.id,
        email: data.email,
        role: data.role,
      },
    });
  } catch (error) {
    console.error('Error in setPIN controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set PIN',
    });
  }
};

/**
 * Login with PIN and generate JWT token
 * POST /auth/login-pin
 */
export const loginPIN = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, pin } = req.body as LoginPINRequest;

    // Fetch user from database by email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or PIN',
      });
      return;
    }

    // Verify PIN with bcrypt
    const isPINValid = await bcrypt.compare(pin, user.pin_hash);

    if (!isPINValid) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or PIN',
      });
      return;
    }

    // Generate JWT token valid for 24 hours
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
        },
      },
    });
  } catch (error) {
    console.error('Error in loginPIN controller:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
    });
  }
};

/**
 * Get authenticated user profile
 * GET /auth/profile
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // User info is attached by auth middleware
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }

    // Fetch complete user data from database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, role, created_at, updated_at')
      .eq('id', req.user.userId)
      .single();

    if (error || !user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
      },
    });
  } catch (error) {
    console.error('Error in getProfile controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile',
    });
  }
};
