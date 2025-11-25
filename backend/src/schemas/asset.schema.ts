import { z } from 'zod';

// Schema for creating an asset
export const createAssetSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  category: z.enum(['Legal', 'Financial', 'Medical', 'Personal', 'Other'], { message: 'Category must be one of: Legal, Financial, Medical, Personal, Other' }),
});

export type CreateAssetRequest = z.infer<typeof createAssetSchema>;

// Schema for updating an asset
export const updateAssetSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters').optional(),
  category: z.enum(['Legal', 'Financial', 'Medical', 'Personal', 'Other'], { message: 'Category must be one of: Legal, Financial, Medical, Personal, Other' }).optional(),
}).refine((data) => data.title !== undefined || data.category !== undefined, {
  message: 'At least one field (title or category) must be provided',
});

export type UpdateAssetRequest = z.infer<typeof updateAssetSchema>;

// Schema for asset ID parameter
export const assetIdParamSchema = z.object({
  id: z.string().uuid('Invalid asset ID'),
});

export type AssetIdParam = z.infer<typeof assetIdParamSchema>;

// Schema for document ID parameter
export const documentIdParamSchema = z.object({
  id: z.string().uuid('Invalid document ID'),
});

export type DocumentIdParam = z.infer<typeof documentIdParamSchema>;
