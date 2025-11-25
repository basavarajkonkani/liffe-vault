import { Request, Response } from 'express';
import {
  getAssetsByUserId,
  getAssetById,
  createAsset as createAssetService,
  updateAsset as updateAssetService,
  deleteAsset as deleteAssetService,
  getAssetStats as getAssetStatsService,
} from '../services/database.service';
import { CreateAssetRequest, UpdateAssetRequest } from '../schemas/asset.schema';

/**
 * Get all assets for the authenticated user based on their role
 * GET /assets
 * - Owners see their own assets
 * - Nominees see assets shared with them
 * - Admins see all assets
 */
export const getAssets = async (req: Request, res: Response): Promise<void> => {
  try {
    // User info is attached by auth middleware
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }

    const { userId, role } = req.user;

    const result = await getAssetsByUserId(userId, role);

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.error,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        assets: result.assets || [],
      },
    });
  } catch (error) {
    console.error('Error in getAssets controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assets',
    });
  }
};

/**
 * Get a single asset by ID with access control check
 * GET /assets/:id
 * RLS policies enforce access control
 */
export const getAssetByIdHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    // User info is attached by auth middleware
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }

    const { id } = req.params;

    const result = await getAssetById(id);

    if (!result.success) {
      // Return 404 for not found or access denied
      res.status(404).json({
        success: false,
        error: result.error,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        asset: result.asset,
      },
    });
  } catch (error) {
    console.error('Error in getAssetById controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch asset',
    });
  }
};

/**
 * Create a new asset for the authenticated owner
 * POST /assets
 * Only Asset Owners can create assets
 */
export const createAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    // User info is attached by auth middleware
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }

    const { userId } = req.user;
    const { title, category } = req.body as CreateAssetRequest;

    const result = await createAssetService(userId, title, category);

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.error,
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Asset created successfully',
      data: {
        asset: result.asset,
      },
    });
  } catch (error) {
    console.error('Error in createAsset controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create asset',
    });
  }
};

/**
 * Update an existing asset's title or category
 * PATCH /assets/:id
 * Only the asset owner can update their assets
 */
export const updateAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    // User info is attached by auth middleware
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }

    const { userId } = req.user;
    const { id } = req.params;
    const updates = req.body as UpdateAssetRequest;

    const result = await updateAssetService(id, userId, updates);

    if (!result.success) {
      // Return 403 for unauthorized, 404 for not found
      const statusCode = result.error?.includes('Unauthorized') ? 403 : 404;
      res.status(statusCode).json({
        success: false,
        error: result.error,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Asset updated successfully',
      data: {
        asset: result.asset,
      },
    });
  } catch (error) {
    console.error('Error in updateAsset controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update asset',
    });
  }
};

/**
 * Delete an asset and all associated documents
 * DELETE /assets/:id
 * Only the asset owner can delete their assets
 */
export const deleteAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    // User info is attached by auth middleware
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }

    const { userId } = req.user;
    const { id } = req.params;

    const result = await deleteAssetService(id, userId);

    if (!result.success) {
      // Return 403 for unauthorized, 404 for not found
      const statusCode = result.error?.includes('Unauthorized') ? 403 : 404;
      res.status(statusCode).json({
        success: false,
        error: result.error,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('Error in deleteAsset controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete asset',
    });
  }
};

/**
 * Get asset statistics for admin dashboard
 * GET /assets/stats
 * Only Administrators can access this endpoint
 */
export const getAssetStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // User info is attached by auth middleware
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }

    const result = await getAssetStatsService();

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.error,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        stats: result.stats,
      },
    });
  } catch (error) {
    console.error('Error in getAssetStats controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch asset statistics',
    });
  }
};
