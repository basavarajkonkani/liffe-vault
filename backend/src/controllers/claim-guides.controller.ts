import { Request, Response } from 'express';
import {
  getAllClaimGuides,
  getClaimGuideById,
  createClaimGuide,
  updateClaimGuide,
  deleteClaimGuide,
} from '../services/database.service';
import { logger } from '../utils/logger';

/**
 * Get all claim guides
 * Accessible by: Owner (read-only), Nominee, Admin
 */
export async function getClaimGuidesHandler(_req: Request, res: Response) {
  try {
    const result = await getAllClaimGuides();

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to fetch claim guides',
      });
    }

    return res.status(200).json({
      success: true,
      data: result.guides,
    });
  } catch (error: any) {
    logger.error('Error in getClaimGuidesHandler:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

/**
 * Get a single claim guide by ID
 * Accessible by: Owner (read-only), Nominee, Admin
 */
export async function getClaimGuideByIdHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const result = await getClaimGuideById(id);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: result.error || 'Claim guide not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: result.guide,
    });
  } catch (error: any) {
    logger.error('Error in getClaimGuideByIdHandler:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

/**
 * Create a new claim guide
 * Accessible by: Admin only
 */
export async function createClaimGuideHandler(req: Request, res: Response) {
  try {
    const guideData = req.body;

    const result = await createClaimGuide(guideData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to create claim guide',
      });
    }

    return res.status(201).json({
      success: true,
      data: result.guide,
      message: 'Claim guide created successfully',
    });
  } catch (error: any) {
    logger.error('Error in createClaimGuideHandler:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

/**
 * Update an existing claim guide
 * Accessible by: Admin only
 */
export async function updateClaimGuideHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const guideData = req.body;

    const result = await updateClaimGuide(id, guideData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to update claim guide',
      });
    }

    return res.status(200).json({
      success: true,
      data: result.guide,
      message: 'Claim guide updated successfully',
    });
  } catch (error: any) {
    logger.error('Error in updateClaimGuideHandler:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

/**
 * Delete a claim guide
 * Accessible by: Admin only
 */
export async function deleteClaimGuideHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const result = await deleteClaimGuide(id);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to delete claim guide',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Claim guide deleted successfully',
    });
  } catch (error: any) {
    logger.error('Error in deleteClaimGuideHandler:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
