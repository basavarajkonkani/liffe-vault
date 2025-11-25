import { z } from 'zod';

/**
 * Document Schemas
 * Zod validation schemas for document-related requests
 */

/**
 * Schema for document ID parameter
 */
export const documentIdParamSchema = z.object({
  id: z.string().uuid('Invalid document ID format'),
});

/**
 * Schema for asset ID parameter (used in document routes)
 */
export const assetIdParamSchema = z.object({
  id: z.string().uuid('Invalid asset ID format'),
});

/**
 * Type exports for TypeScript
 */
export type DocumentIdParam = z.infer<typeof documentIdParamSchema>;
export type AssetIdParam = z.infer<typeof assetIdParamSchema>;
