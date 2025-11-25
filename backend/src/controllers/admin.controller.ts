import { Request, Response } from 'express';
import {
  getAllUsers,
  getAllAssets,
  getUserById as getUserByIdService,
  updateUserStatus,
  getSystemStats,
} from '../services/database.service';
import { UpdateUserRequest } from '../schemas/admin.schema';

/**
 * Get all users with pagination and search
 * GET /admin/users
 * Only Administrators can access this endpoint
 */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    // User info is attached by auth middleware
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }

    // Extract pagination and search parameters from query
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string | undefined;

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      res.status(400).json({
        success: false,
        error: 'Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100',
      });
      return;
    }

    const result = await getAllUsers(page, limit, search);

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
        users: result.users || [],
        pagination: result.pagination,
      },
    });
  } catch (error) {
    console.error('Error in getUsers controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
    });
  }
};

/**
 * Get all assets with pagination and filters
 * GET /admin/assets
 * Only Administrators can access this endpoint
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

    // Extract pagination and filter parameters from query
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string | undefined;
    const category = req.query.category as string | undefined;

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      res.status(400).json({
        success: false,
        error: 'Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100',
      });
      return;
    }

    const result = await getAllAssets(page, limit, search, category);

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
        pagination: result.pagination,
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
 * Get detailed information for a specific user
 * GET /admin/users/:id
 * Only Administrators can access this endpoint
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
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

    const result = await getUserByIdService(id);

    if (!result.success) {
      // Return 404 for not found
      res.status(404).json({
        success: false,
        error: result.error,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    console.error('Error in getUserById controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user',
    });
  }
};

/**
 * Update user role or status
 * PATCH /admin/users/:id
 * Only Administrators can access this endpoint
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
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
    const updates = req.body as UpdateUserRequest;

    // Validate that at least one field is being updated
    if (!updates.role) {
      res.status(400).json({
        success: false,
        error: 'No valid fields to update',
      });
      return;
    }

    const result = await updateUserStatus(id, updates);

    if (!result.success) {
      // Return 404 for not found
      res.status(404).json({
        success: false,
        error: result.error,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    console.error('Error in updateUser controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user',
    });
  }
};

/**
 * Get system-wide statistics for admin dashboard
 * GET /admin/stats
 * Only Administrators can access this endpoint
 */
export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // User info is attached by auth middleware
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }

    const result = await getSystemStats();

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
    console.error('Error in getStats controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch system statistics',
    });
  }
};
