import { Router } from 'express';
import {
  getClaimGuidesHandler,
  getClaimGuideByIdHandler,
  createClaimGuideHandler,
  updateClaimGuideHandler,
  deleteClaimGuideHandler,
} from '../controllers/claim-guides.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validateBody, validateParams } from '../middleware/validate.middleware';
import {
  createClaimGuideSchema,
  updateClaimGuideSchema,
  claimGuideIdSchema,
} from '../schemas/claim-guides.schema';

const router = Router();

/**
 * GET /claim-guides
 * Get all claim guides
 * Accessible by: All authenticated users
 */
router.get('/', authenticateToken, getClaimGuidesHandler);

/**
 * GET /claim-guides/:id
 * Get a single claim guide by ID
 * Accessible by: All authenticated users
 */
router.get(
  '/:id',
  authenticateToken,
  validateParams(claimGuideIdSchema),
  getClaimGuideByIdHandler
);

/**
 * POST /claim-guides
 * Create a new claim guide
 * Accessible by: Admin only
 */
router.post(
  '/',
  authenticateToken,
  requireRole(['admin']),
  validateBody(createClaimGuideSchema),
  createClaimGuideHandler
);

/**
 * PATCH /claim-guides/:id
 * Update an existing claim guide
 * Accessible by: Admin only
 */
router.patch(
  '/:id',
  authenticateToken,
  requireRole(['admin']),
  validateParams(claimGuideIdSchema),
  validateBody(updateClaimGuideSchema),
  updateClaimGuideHandler
);

/**
 * DELETE /claim-guides/:id
 * Delete a claim guide
 * Accessible by: Admin only
 */
router.delete(
  '/:id',
  authenticateToken,
  requireRole(['admin']),
  validateParams(claimGuideIdSchema),
  deleteClaimGuideHandler
);

export default router;
