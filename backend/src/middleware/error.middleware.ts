import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { env } from '../config/env';

/**
 * Global error handler middleware
 * Handles different types of errors and returns appropriate HTTP responses
 * 
 * @param err - Error object
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log errors to console in development mode
  if (env.NODE_ENV === 'development') {
    console.error('Error:', err);
    console.error('Stack:', err.stack);
  }

  // Handle Zod validation errors (return 400)
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return;
  }

  // Handle JsonWebTokenError for invalid tokens (return 401)
  if (err instanceof JsonWebTokenError) {
    res.status(401).json({
      success: false,
      error: 'Invalid token',
    });
    return;
  }

  // Handle TokenExpiredError for expired tokens (return 401)
  if (err instanceof TokenExpiredError) {
    res.status(401).json({
      success: false,
      error: 'Token expired',
    });
    return;
  }

  // Handle CORS errors
  if (err.message === 'Not allowed by CORS') {
    res.status(403).json({
      success: false,
      error: 'CORS policy violation',
    });
    return;
  }

  // Handle generic errors without exposing internal details (return 500)
  // In development mode, expose the error message for debugging
  res.status(500).json({
    success: false,
    error: env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
};
