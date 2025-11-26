import { z } from 'zod';

// Schema for a single step in the claim process
export const claimStepSchema = z.object({
  step: z.number().int().positive(),
  description: z.string().min(1),
});

// Schema for a link object
export const claimLinkSchema = z.object({
  label: z.string().min(1),
  url: z.string().url().or(z.literal('#')), // Allow placeholder '#' for future links
});

// Schema for creating a new claim guide
export const createClaimGuideSchema = z.object({
  category: z.string().min(1),
  title: z.string().min(1),
  steps: z.array(claimStepSchema),
  documents: z.array(z.string()),
  contact_info: z.string().optional(),
  links: z.array(claimLinkSchema).optional(),
});

// Schema for updating an existing claim guide
export const updateClaimGuideSchema = z.object({
  category: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  steps: z.array(claimStepSchema).optional(),
  documents: z.array(z.string()).optional(),
  contact_info: z.string().optional(),
  links: z.array(claimLinkSchema).optional(),
});

// Schema for claim guide ID parameter
export const claimGuideIdSchema = z.object({
  id: z.string().uuid(),
});

export type ClaimStep = z.infer<typeof claimStepSchema>;
export type ClaimLink = z.infer<typeof claimLinkSchema>;
export type CreateClaimGuideInput = z.infer<typeof createClaimGuideSchema>;
export type UpdateClaimGuideInput = z.infer<typeof updateClaimGuideSchema>;
