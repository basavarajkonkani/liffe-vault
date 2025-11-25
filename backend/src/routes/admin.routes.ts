import { Router } from 'express';
import {
  getUsers,
  getAssets,
  getUserById,
  updateUser,
  getStats,
} from '../controllers/admin.controller';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.middleware';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import {
  updateUserSchema,
  userIdParamSchema,
  paginationQuerySchema,
  assetPaginationQuerySchema,
} from '../schemas/admin.schema';

const router = Router();

/**
 * All admin routes require authentication and admin role
 * Apply middleware to all routes in this router
 */
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * GET /admin/stats
 * Get system-wide statistics for admin dashboard
 * Returns comprehensive metrics about users, assets, and storage
 * Note: This route must be defined before /admin/users/:id to avoid route conflicts
 */
router.get(
  '/stats',
  getStats
);

/**
 * GET /admin/users
 * Get all users with pagination and search
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10, max: 100)
 * - search: Search query to filter by email
 */
router.get(
  '/users',
  validateQuery(paginationQuerySchema),
  getUsers
);

/**
 * GET /admin/users/:id
 * Get detailed information for a specific user
 * Includes user's assets and statistics if they are an owner
 */
router.get(
  '/users/:id',
  validateParams(userIdParamSchema),
  getUserById
);

/**
 * PATCH /admin/users/:id
 * Update user role or status
 * Allows administrators to change user roles
 */
router.patch(
  '/users/:id',
  validateParams(userIdParamSchema),
  validateBody(updateUserSchema),
  updateUser
);

/**
 * GET /admin/assets
 * Get all assets in the system with pagination and filters
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10, max: 100)
 * - search: Search query to filter by title
 * - category: Filter by asset category
 */
router.get(
  '/assets',
  validateQuery(assetPaginationQuerySchema),
  getAssets
);

export default router;
