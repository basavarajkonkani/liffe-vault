import { Request, Response, NextFunction } from 'express';

/**
 * Role-Based Access Control Middleware
 * Checks if the authenticated user has the required role(s)
 */

/**
 * Generic middleware factory to require specific role(s)
 * @param allowedRoles - Array of roles that are allowed to access the route
 * @returns Express middleware function
 */
export const requireRole = (allowedRoles: Array<'owner' | 'nominee' | 'admin'>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Check if user is authenticated (should be set by authenticateToken middleware)
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    // Check if user's role is in the allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'You do not have permission to access this resource'
      });
      return;
    }

    // User has required role, continue to next middleware/route handler
    next();
  };
};

/**
 * Middleware to require Asset Owner role
 * Only users with 'owner' role can access the route
 */
export const requireOwner = requireRole(['owner']);

/**
 * Middleware to require Administrator role
 * Only users with 'admin' role can access the route
 */
export const requireAdmin = requireRole(['admin']);

/**
 * Middleware to require either Owner or Admin role
 * Useful for routes that both owners and admins can access
 */
export const requireOwnerOrAdmin = requireRole(['owner', 'admin']);

/**
 * Middleware to require Nominee role
 * Only users with 'nominee' role can access the route
 */
export const requireNominee = requireRole(['nominee']);
