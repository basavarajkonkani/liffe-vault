import { Router } from 'express';
import {
  getNominees,
  linkNominee,
  unlinkNominee,
  getLinkedNominees,
} from '../controllers/nominees.controller';
import { validateBody, validateParams } from '../middleware/validate.middleware';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireOwner } from '../middleware/role.middleware';
import {
  linkNomineeSchema,
  unlinkNomineeParamSchema,
  assetIdParamSchema,
} from '../schemas/nominee.schema';

const router = Router();

/**
 * GET /nominees
 * Get all available nominees that can be linked to assets
 * Returns list of users with nominee role
 * Requires: Authentication
 */
router.get(
  '/',
  authenticateToken,
  getNominees
);

/**
 * POST /nominees/link
 * Link a nominee to an asset
 * Verifies asset ownership before creating the link
 * Requires: Authentication + Owner role
 * Body: { assetId: string, nomineeId: string }
 */
router.post(
  '/link',
  authenticateToken,
  requireOwner,
  validateBody(linkNomineeSchema),
  linkNominee
);

/**
 * DELETE /nominees/link/:id
 * Unlink a nominee from an asset
 * Verifies asset ownership before removing the link
 * Requires: Authentication + Owner role
 * Params: { id: string } - linked nominee record ID
 */
router.delete(
  '/link/:id',
  authenticateToken,
  requireOwner,
  validateParams(unlinkNomineeParamSchema),
  unlinkNominee
);

/**
 * GET /nominees/asset/:assetId
 * Get all nominees linked to a specific asset
 * Returns nominees with user information
 * Requires: Authentication
 * Params: { assetId: string }
 */
router.get(
  '/asset/:assetId',
  authenticateToken,
  validateParams(assetIdParamSchema),
  getLinkedNominees
);

export default router;
