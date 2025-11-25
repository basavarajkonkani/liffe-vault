import { Router } from 'express';
import {
  getAssets,
  getAssetByIdHandler,
  createAsset,
  updateAsset,
  deleteAsset,
  getAssetStats,
} from '../controllers/assets.controller';
import { validateBody, validateParams } from '../middleware/validate.middleware';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireOwner, requireAdmin } from '../middleware/role.middleware';
import {
  createAssetSchema,
  updateAssetSchema,
  assetIdParamSchema,
} from '../schemas/asset.schema';

const router = Router();

/**
 * GET /assets/stats
 * Get asset statistics for admin dashboard
 * Requires: Admin role
 * Note: This route must be defined before /assets/:id to avoid route conflicts
 */
router.get(
  '/stats',
  authenticateToken,
  requireAdmin,
  getAssetStats
);

/**
 * GET /assets
 * Get all assets for the authenticated user based on their role
 * - Owners see their own assets
 * - Nominees see assets shared with them
 * - Admins see all assets
 * Requires: Authentication
 */
router.get(
  '/',
  authenticateToken,
  getAssets
);

/**
 * POST /assets
 * Create a new asset for the authenticated owner
 * Requires: Authentication + Owner role
 */
router.post(
  '/',
  authenticateToken,
  requireOwner,
  validateBody(createAssetSchema),
  createAsset
);

/**
 * GET /assets/:id
 * Get a single asset by ID with access control check
 * RLS policies enforce access control
 * Requires: Authentication
 */
router.get(
  '/:id',
  authenticateToken,
  validateParams(assetIdParamSchema),
  getAssetByIdHandler
);

/**
 * PATCH /assets/:id
 * Update an existing asset's title or category
 * Only the asset owner can update their assets
 * Requires: Authentication + Owner role
 */
router.patch(
  '/:id',
  authenticateToken,
  requireOwner,
  validateParams(assetIdParamSchema),
  validateBody(updateAssetSchema),
  updateAsset
);

/**
 * DELETE /assets/:id
 * Delete an asset and all associated documents
 * Only the asset owner can delete their assets
 * Requires: Authentication + Owner role
 */
router.delete(
  '/:id',
  authenticateToken,
  requireOwner,
  validateParams(assetIdParamSchema),
  deleteAsset
);

export default router;
