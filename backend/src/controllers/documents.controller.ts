import { Request, Response } from 'express';
import multer from 'multer';
import {
  uploadDocument as uploadDocumentService,
  getDocumentsByAssetId,
  getDocumentDownloadUrl,
  deleteDocument as deleteDocumentService,
} from '../services/storage.service';
import { getAssetById } from '../services/database.service';

/**
 * Configure multer for file uploads
 * Store files in memory as Buffer for direct upload to Supabase Storage
 */
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB max file size
  },
  fileFilter: (_req, _file, cb) => {
    // Accept all file types
    cb(null, true);
  },
});

/**
 * Multer middleware for single file upload
 * Field name: 'file'
 */
export const uploadMiddleware = upload.single('file');

/**
 * Upload a document to an asset
 * POST /assets/:id/documents
 * Requires: Authentication + Asset ownership
 */
export const uploadDocument = async (req: Request, res: Response): Promise<void> => {
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
    const { id: assetId } = req.params;

    // Check if file was uploaded
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
      return;
    }

    // Validate file size (max 50 MB)
    const maxSize = 50 * 1024 * 1024; // 50 MB in bytes
    if (req.file.size > maxSize) {
      res.status(400).json({
        success: false,
        error: 'File size exceeds 50 MB limit',
      });
      return;
    }

    // Verify asset exists and user is the owner
    const assetResult = await getAssetById(assetId);
    
    if (!assetResult.success || !assetResult.asset) {
      res.status(404).json({
        success: false,
        error: 'Asset not found',
      });
      return;
    }

    // Check ownership
    if (assetResult.asset.owner_id !== userId) {
      res.status(403).json({
        success: false,
        error: 'Unauthorized: You can only upload documents to your own assets',
      });
      return;
    }

    // Upload document to Supabase Storage
    const result = await uploadDocumentService(
      assetId,
      req.file.buffer,
      req.file.originalname,
      req.file.size
    );

    if (!result.success) {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to upload document',
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        document: result.document,
      },
    });
  } catch (error) {
    console.error('Error in uploadDocument controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload document',
    });
  }
};

/**
 * Get all documents for an asset
 * GET /assets/:id/documents
 * Requires: Authentication + Asset access (owner, linked nominee, or admin)
 */
export const getDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    // User info is attached by auth middleware
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }

    const { id: assetId } = req.params;

    // Verify user has access to the asset (RLS will enforce this)
    const assetResult = await getAssetById(assetId);
    
    if (!assetResult.success || !assetResult.asset) {
      res.status(404).json({
        success: false,
        error: 'Asset not found or access denied',
      });
      return;
    }

    // Get documents for the asset
    const result = await getDocumentsByAssetId(assetId);

    if (!result.success) {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to fetch documents',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        documents: result.documents || [],
      },
    });
  } catch (error) {
    console.error('Error in getDocuments controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch documents',
    });
  }
};

/**
 * Generate a signed URL for document download
 * GET /documents/:id/download
 * Requires: Authentication + Document access (owner, linked nominee, or admin)
 */
export const downloadDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    // User info is attached by auth middleware
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }

    const { id: documentId } = req.params;

    // Generate signed URL (RLS policies will enforce access control)
    const result = await getDocumentDownloadUrl(documentId);

    if (!result.success) {
      res.status(404).json({
        success: false,
        error: result.error || 'Document not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        url: result.url,
        expiresIn: 60, // seconds
      },
    });
  } catch (error) {
    console.error('Error in downloadDocument controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate download URL',
    });
  }
};

/**
 * Delete a document
 * DELETE /documents/:id
 * Requires: Authentication + Asset ownership
 */
export const deleteDocument = async (req: Request, res: Response): Promise<void> => {
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
    const { id: documentId } = req.params;

    // First, get the document to find its asset
    const { data: document, error: fetchError } = await (await import('../config/supabase')).supabase
      .from('documents')
      .select('asset_id')
      .eq('id', documentId)
      .single();

    if (fetchError || !document) {
      res.status(404).json({
        success: false,
        error: 'Document not found',
      });
      return;
    }

    // Verify user owns the asset
    const assetResult = await getAssetById(document.asset_id);
    
    if (!assetResult.success || !assetResult.asset) {
      res.status(404).json({
        success: false,
        error: 'Asset not found',
      });
      return;
    }

    // Check ownership
    if (assetResult.asset.owner_id !== userId) {
      res.status(403).json({
        success: false,
        error: 'Unauthorized: You can only delete documents from your own assets',
      });
      return;
    }

    // Delete the document
    const result = await deleteDocumentService(documentId);

    if (!result.success) {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to delete document',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('Error in deleteDocument controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete document',
    });
  }
};
