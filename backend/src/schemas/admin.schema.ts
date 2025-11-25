import { z } from 'zod';

// Schema for updating user
export const updateUserSchema = z.object({
  role: z.enum(['owner', 'nominee', 'admin'], { 
    message: 'Role must be one of: owner, nominee, admin' 
  }).optional(),
});

export type UpdateUserRequest = z.infer<typeof updateUserSchema>;

// Schema for user ID parameter
export const userIdParamSchema = z.object({
  id: z.string().uuid('Invalid user ID format'),
});

export type UserIdParam = z.infer<typeof userIdParamSchema>;

// Schema for pagination query parameters
export const paginationQuerySchema = z.object({
  page: z.string().regex(/^\d+$/, 'Page must be a positive number').optional(),
  limit: z.string().regex(/^\d+$/, 'Limit must be a positive number').optional(),
  search: z.string().optional(),
}).transform((data) => ({
  page: data.page || '1',
  limit: data.limit || '10',
  search: data.search,
}));

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

// Schema for asset pagination with filters
export const assetPaginationQuerySchema = z.object({
  page: z.string().regex(/^\d+$/, 'Page must be a positive number').optional(),
  limit: z.string().regex(/^\d+$/, 'Limit must be a positive number').optional(),
  search: z.string().optional(),
  category: z.enum(['Legal', 'Financial', 'Medical', 'Personal', 'Other']).optional(),
}).transform((data) => ({
  page: data.page || '1',
  limit: data.limit || '10',
  search: data.search,
  category: data.category,
}));

export type AssetPaginationQuery = z.infer<typeof assetPaginationQuerySchema>;
