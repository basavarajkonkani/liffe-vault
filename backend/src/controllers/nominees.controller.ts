import { Request, Response } from 'express';
import {
  getNominees as getNomineesService,
  linkNominee as linkNomineeService,
  unlinkNominee as unlinkNomineeService,
  getLinkedNominees as getLinkedNomineesService,
} from '../services/database.service';

/**
 * Nominees Controller
 * Handles nominee management operations
 */

/**
 * GET /nominees
 * Get all available nominees that can be linked to assets
 * Returns list of users with nominee role
 */
export async function getNominees(_req: Request, res: Response): Promise<void> {
  try {
    const result = await getNomineesService();

    if (!result.success) {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to fetch nominees',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: result.nominees,
    });
  } catch (error) {
    console.error('Error in getNominees controller:', error);
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred',
    });
  }
}

/**
 * POST /nominees/link
 * Link a nominee to an asset
 * Verifies asset ownership before creating the link
 * Body: { assetId: string, nomineeId: string }
 */
export async function linkNominee(req: Request, res: Response): Promise<void> {
  try {
    const { assetId, nomineeId } = req.body;
    const userId = req.user!.userId;

    const result = await linkNomineeService(assetId, nomineeId, userId);

    if (!result.success) {
      // Determine appropriate status code based on error
      let statusCode = 500;
      if (result.error?.includes('not found')) {
        statusCode = 404;
      } else if (result.error?.includes('Unauthorized') || result.error?.includes('already linked')) {
        statusCode = 403;
      }

      res.status(statusCode).json({
        success: false,
        error: result.error || 'Failed to link nominee',
      });
      return;
    }

    res.status(201).json({
      success: true,
      data: result.linkedNominee,
      message: 'Nominee linked successfully',
    });
  } catch (error) {
    console.error('Error in linkNominee controller:', error);
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred',
    });
  }
}

/**
 * DELETE /nominees/link/:id
 * Unlink a nominee from an asset
 * Verifies asset ownership before removing the link
 * Params: { id: string } - linked nominee record ID
 */
export async function unlinkNominee(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const result = await unlinkNomineeService(id, userId);

    if (!result.success) {
      // Determine appropriate status code based on error
      let statusCode = 500;
      if (result.error?.includes('not found')) {
        statusCode = 404;
      } else if (result.error?.includes('Unauthorized')) {
        statusCode = 403;
      }

      res.status(statusCode).json({
        success: false,
        error: result.error || 'Failed to unlink nominee',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: result.message || 'Nominee unlinked successfully',
    });
  } catch (error) {
    console.error('Error in unlinkNominee controller:', error);
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred',
    });
  }
}

/**
 * GET /nominees/asset/:assetId
 * Get all nominees linked to a specific asset
 * Returns nominees with user information
 * Params: { assetId: string }
 */
export async function getLinkedNominees(req: Request, res: Response): Promise<void> {
  try {
    const { assetId } = req.params;

    const result = await getLinkedNomineesService(assetId);

    if (!result.success) {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to fetch linked nominees',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: result.linkedNominees,
    });
  } catch (error) {
    console.error('Error in getLinkedNominees controller:', error);
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred',
    });
  }
}
