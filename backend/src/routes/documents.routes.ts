import { Router } from 'express';
import {
  uploadDocument,
  getDocuments,
  downloadDocument,
  deleteDocument,
  uploadMiddleware,
} from '../controllers/documents.controller';
import { validateParams } from '../middleware/validate.middleware';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  documentIdParamSchema,
  assetIdParamSchema,
} from '../schemas/document.schema';

const router = Router();

/**
 * POST /assets/:id/documents
 * Upload a document to an asset
 * Requires: Authentication + Asset ownership
 * Uses multer middleware for multipart/form-data
 */
router.post(
  '/assets/:id/documents',
  authenticateToken,
  validateParams(assetIdParamSchema),
  uploadMiddleware,
  uploadDocument
);

/**
 * GET /assets/:id/documents
 * Get all documents for an asset
 * Requires: Authentication + Asset access (owner, linked nominee, or admin)
 */
router.get(
  '/assets/:id/documents',
  authenticateToken,
  validateParams(assetIdParamSchema),
  getDocuments
);

/**
 * GET /documents/:id/download
 * Generate a signed URL for document download
 * Requires: Authentication + Document access (owner, linked nominee, or admin)
 */
router.get(
  '/documents/:id/download',
  authenticateToken,
  validateParams(documentIdParamSchema),
  downloadDocument
);

/**
 * DELETE /documents/:id
 * Delete a document
 * Requires: Authentication + Asset ownership
 */
router.delete(
  '/documents/:id',
  authenticateToken,
  validateParams(documentIdParamSchema),
  deleteDocument
);

export default router;
