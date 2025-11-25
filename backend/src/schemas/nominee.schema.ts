import { z } from 'zod';

// Schema for linking a nominee to an asset
export const linkNomineeSchema = z.object({
  assetId: z.string().uuid('Invalid asset ID'),
  nomineeId: z.string().uuid('Invalid nominee ID'),
});

export type LinkNomineeRequest = z.infer<typeof linkNomineeSchema>;

// Schema for unlinking a nominee (link ID parameter)
export const unlinkNomineeParamSchema = z.object({
  id: z.string().uuid('Invalid link ID'),
});

export type UnlinkNomineeParam = z.infer<typeof unlinkNomineeParamSchema>;

// Schema for getting linked nominees by asset ID
export const assetIdParamSchema = z.object({
  assetId: z.string().uuid('Invalid asset ID'),
});

export type AssetIdParam = z.infer<typeof assetIdParamSchema>;
