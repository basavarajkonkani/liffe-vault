import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JWTPayload, RequestUser } from '../types';

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
    }
  }
}

/**
 * JWT Authentication Middleware
 * Verifies JWT token from Authorization header and attaches user info to request
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Extract token from Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({
        success: false,
        error: 'Authorization header missing'
      });
      return;
    }

    // Check if header follows "Bearer <token>" format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({
        success: false,
        error: 'Invalid authorization header format. Expected: Bearer <token>'
      });
      return;
    }

    const token = parts[1];

    // Verify token using JWT_SECRET and decode payload
    const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;

    // Attach user information to req.user for downstream use
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role as 'owner' | 'nominee' | 'admin'
    };

    // Continue to next middleware/route handler
    next();
  } catch (error) {
    // Handle JWT-specific errors
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Token expired'
      });
      return;
    }

    // Handle unexpected errors
    res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};
