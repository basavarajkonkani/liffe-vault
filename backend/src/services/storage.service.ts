import { supabase } from '../config/supabase';
import { Document } from '../types';
import { logger } from '../utils/logger';

/**
 * Storage Service
 * Handles Supabase Storage operations for document uploads, downloads, and deletions
 */

const STORAGE_BUCKET = 'documents';

/**
 * Upload a document to Supabase Storage and store metadata in database
 * Generates unique file path using asset ID and timestamp
 * 
 * @param assetId - Asset's unique identifier
 * @param file - File buffer to upload
 * @param fileName - Original file name
 * @param fileSize - File size in bytes
 * @returns Document metadata
 */
export async function uploadDocument(
  assetId: string,
  file: Buffer,
  fileName: string,
  fileSize: number
): Promise<{
  success: boolean;
  document?: Document;
  error?: string;
}> {
  try {
    // Generate unique file path: assets/{assetId}/{timestamp}-{fileName}
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `assets/${assetId}/${timestamp}-${sanitizedFileName}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        contentType: 'application/octet-stream',
        upsert: false,
      });

    if (uploadError) {
      logger.error('Supabase Storage upload error:', uploadError);
      return {
        success: false,
        error: 'Failed to upload file to storage',
      };
    }

    // Store document metadata in database
    const { data: documentData, error: dbError } = await supabase
      .from('documents')
      .insert({
        asset_id: assetId,
        file_name: fileName,
        file_path: uploadData.path,
        file_size: fileSize,
      })
      .select()
      .single();

    if (dbError) {
      logger.error('Database error storing document metadata:', dbError);
      
      // Cleanup: Delete uploaded file if database insert fails
      await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([filePath]);

      return {
        success: false,
        error: 'Failed to store document metadata',
      };
    }

    return {
      success: true,
      document: documentData as Document,
    };
  } catch (error) {
    logger.error('Unexpected error uploading document:', error);
    return {
      success: false,
      error: 'An unexpected error occurred during upload',
    };
  }
}

/**
 * Generate a signed URL for secure document download
 * URL expires after 60 seconds
 * 
 * @param documentId - Document's unique identifier
 * @returns Signed download URL
 */
export async function getDocumentDownloadUrl(
  documentId: string
): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> {
  try {
    // First, get the document metadata to retrieve file path
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('file_path')
      .eq('id', documentId)
      .single();

    if (fetchError || !document) {
      logger.error('Error fetching document:', fetchError);
      return {
        success: false,
        error: 'Document not found',
      };
    }

    // Generate signed URL with 60 second expiry
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(document.file_path, 60);

    if (urlError || !signedUrlData) {
      logger.error('Error generating signed URL:', urlError);
      return {
        success: false,
        error: 'Failed to generate download URL',
      };
    }

    return {
      success: true,
      url: signedUrlData.signedUrl,
    };
  } catch (error) {
    logger.error('Unexpected error generating download URL:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Delete a document from both Supabase Storage and database
 * Removes file from storage bucket and deletes metadata record
 * 
 * @param documentId - Document's unique identifier
 * @returns Success status
 */
export async function deleteDocument(
  documentId: string
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    // First, get the document metadata to retrieve file path
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('file_path, asset_id')
      .eq('id', documentId)
      .single();

    if (fetchError || !document) {
      logger.error('Error fetching document:', fetchError);
      return {
        success: false,
        error: 'Document not found',
      };
    }

    // Delete file from Supabase Storage
    const { error: storageError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([document.file_path]);

    if (storageError) {
      logger.error('Error deleting file from storage:', storageError);
      // Continue with database deletion even if storage deletion fails
      // The file might already be deleted or not exist
    }

    // Delete document metadata from database
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (dbError) {
      logger.error('Error deleting document from database:', dbError);
      return {
        success: false,
        error: 'Failed to delete document metadata',
      };
    }

    return {
      success: true,
      message: 'Document deleted successfully',
    };
  } catch (error) {
    logger.error('Unexpected error deleting document:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Get all documents for a specific asset
 * 
 * @param assetId - Asset's unique identifier
 * @returns Array of documents
 */
export async function getDocumentsByAssetId(
  assetId: string
): Promise<{
  success: boolean;
  documents?: Document[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('asset_id', assetId)
      .order('uploaded_at', { ascending: false });

    if (error) {
      logger.error('Error fetching documents:', error);
      return {
        success: false,
        error: 'Failed to fetch documents',
      };
    }

    return {
      success: true,
      documents: data as Document[],
    };
  } catch (error) {
    logger.error('Unexpected error fetching documents:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}
