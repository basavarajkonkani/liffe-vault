import { supabase } from '../config/supabase';
import { AuthError } from '@supabase/supabase-js';

/**
 * Authentication Service
 * Handles Supabase Auth operations for OTP-based authentication
 */

/**
 * Send OTP to user's email using Supabase Auth
 * @param email - User's email address
 * @returns Success status and message
 */
export async function sendOTP(email: string): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      console.error('Supabase OTP error:', error);
      return {
        success: false,
        message: 'Failed to send OTP',
        error: getAuthErrorMessage(error),
      };
    }

    return {
      success: true,
      message: 'OTP sent successfully to your email',
    };
  } catch (error) {
    console.error('Unexpected error sending OTP:', error);
    return {
      success: false,
      message: 'Failed to send OTP',
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Verify OTP code for user authentication
 * @param email - User's email address
 * @param token - OTP code received via email
 * @returns Success status, user data, and session information
 */
export async function verifyOTP(
  email: string,
  token: string
): Promise<{
  success: boolean;
  message: string;
  userId?: string;
  email?: string;
  error?: string;
}> {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) {
      console.error('Supabase OTP verification error:', error);
      return {
        success: false,
        message: 'OTP verification failed',
        error: getAuthErrorMessage(error),
      };
    }

    if (!data.user) {
      return {
        success: false,
        message: 'OTP verification failed',
        error: 'User not found after verification',
      };
    }

    return {
      success: true,
      message: 'OTP verified successfully',
      userId: data.user.id,
      email: data.user.email || email,
    };
  } catch (error) {
    console.error('Unexpected error verifying OTP:', error);
    return {
      success: false,
      message: 'OTP verification failed',
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Get user by ID from Supabase Auth
 * @param userId - User's unique identifier
 * @returns User data or null if not found
 */
export async function getUserById(userId: string): Promise<{
  success: boolean;
  user?: {
    id: string;
    email: string;
    created_at: string;
  };
  error?: string;
}> {
  try {
    const { data, error } = await supabase.auth.admin.getUserById(userId);

    if (error) {
      console.error('Supabase get user error:', error);
      return {
        success: false,
        error: getAuthErrorMessage(error),
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email || '',
        created_at: data.user.created_at,
      },
    };
  } catch (error) {
    console.error('Unexpected error fetching user:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Helper function to convert Supabase AuthError to user-friendly message
 * @param error - Supabase AuthError object
 * @returns User-friendly error message
 */
function getAuthErrorMessage(error: AuthError): string {
  // Handle specific error codes
  switch (error.status) {
    case 400:
      if (error.message.includes('invalid')) {
        return 'Invalid OTP code. Please check and try again.';
      }
      if (error.message.includes('expired')) {
        return 'OTP code has expired. Please request a new one.';
      }
      return 'Invalid request. Please check your input.';
    
    case 401:
      return 'Authentication failed. Please try again.';
    
    case 422:
      return 'Invalid email format or OTP code.';
    
    case 429:
      return 'Too many attempts. Please try again later.';
    
    case 500:
    case 503:
      return 'Service temporarily unavailable. Please try again later.';
    
    default:
      // Return the original error message if it's user-friendly
      if (error.message && !error.message.includes('supabase') && !error.message.includes('database')) {
        return error.message;
      }
      return 'An error occurred during authentication.';
  }
}
