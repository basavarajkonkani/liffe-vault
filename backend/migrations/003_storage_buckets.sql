-- LifeVault Database Migration
-- Version: 003
-- Description: Supabase Storage bucket creation and RLS policies for document storage

-- ============================================================================
-- CREATE STORAGE BUCKET
-- ============================================================================

-- Note: Storage buckets are created via Supabase Dashboard or API
-- This file documents the configuration and provides the RLS policies

-- Bucket Configuration (to be applied in Supabase Dashboard):
-- Name: documents
-- Public: false (private bucket)
-- File size limit: 52428800 bytes (50 MB)
-- Allowed MIME types: All types allowed (validation done in backend)

-- To create the bucket via SQL (if using Supabase CLI):
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  52428800, -- 50 MB in bytes
  NULL -- Allow all MIME types (backend validates)
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE RLS POLICIES
-- ============================================================================

-- Enable RLS on storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLICY 1: Asset Owners can upload documents to their asset folders
-- ============================================================================

CREATE POLICY "owners_upload_to_own_assets"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'documents'
  AND auth.uid() IS NOT NULL
  AND (
    -- Extract asset_id from path (format: asset_id/filename)
    -- Path structure: {asset_id}/{timestamp}_{filename}
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM assets WHERE owner_id = auth.uid()
    )
  )
);

-- ============================================================================
-- POLICY 2: Asset Owners can view/download their own documents
-- ============================================================================

CREATE POLICY "owners_download_own_documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'documents'
  AND auth.uid() IS NOT NULL
  AND (
    -- Check if the asset belongs to the authenticated user
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM assets WHERE owner_id = auth.uid()
    )
  )
);

-- ============================================================================
-- POLICY 3: Nominees can view/download documents from shared assets
-- ============================================================================

CREATE POLICY "nominees_download_shared_documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'documents'
  AND auth.uid() IS NOT NULL
  AND (
    -- Check if the asset is shared with the authenticated nominee
    (storage.foldername(name))[1] IN (
      SELECT a.id::text
      FROM assets a
      JOIN linked_nominees ln ON ln.asset_id = a.id
      JOIN nominees n ON n.id = ln.nominee_id
      WHERE n.user_id = auth.uid()
    )
  )
);

-- ============================================================================
-- POLICY 4: Admins can view/download all documents
-- ============================================================================

CREATE POLICY "admins_download_all_documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'documents'
  AND auth.uid() IS NOT NULL
  AND (
    -- Check if user is an admin
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
);

-- ============================================================================
-- POLICY 5: Asset Owners can delete their own documents
-- ============================================================================

CREATE POLICY "owners_delete_own_documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'documents'
  AND auth.uid() IS NOT NULL
  AND (
    -- Check if the asset belongs to the authenticated user
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM assets WHERE owner_id = auth.uid()
    )
  )
);

-- ============================================================================
-- POLICY 6: Admins can delete any document (for moderation)
-- ============================================================================

CREATE POLICY "admins_delete_all_documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'documents'
  AND auth.uid() IS NOT NULL
  AND (
    -- Check if user is an admin
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
);

-- ============================================================================
-- POLICY 7: Asset Owners can update their own documents (metadata)
-- ============================================================================

CREATE POLICY "owners_update_own_documents"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'documents'
  AND auth.uid() IS NOT NULL
  AND (
    -- Check if the asset belongs to the authenticated user
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM assets WHERE owner_id = auth.uid()
    )
  )
)
WITH CHECK (
  bucket_id = 'documents'
  AND auth.uid() IS NOT NULL
  AND (
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM assets WHERE owner_id = auth.uid()
    )
  )
);

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON POLICY "owners_upload_to_own_assets" ON storage.objects IS 
  'Asset owners can upload documents to folders corresponding to their assets';

COMMENT ON POLICY "owners_download_own_documents" ON storage.objects IS 
  'Asset owners can download documents from their own asset folders';

COMMENT ON POLICY "nominees_download_shared_documents" ON storage.objects IS 
  'Nominees can download documents from assets that have been shared with them';

COMMENT ON POLICY "admins_download_all_documents" ON storage.objects IS 
  'Administrators can download any document for support and moderation purposes';

COMMENT ON POLICY "owners_delete_own_documents" ON storage.objects IS 
  'Asset owners can delete documents from their own asset folders';

COMMENT ON POLICY "admins_delete_all_documents" ON storage.objects IS 
  'Administrators can delete any document for moderation purposes';

COMMENT ON POLICY "owners_update_own_documents" ON storage.objects IS 
  'Asset owners can update metadata for documents in their own asset folders';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check if bucket exists
-- SELECT * FROM storage.buckets WHERE id = 'documents';

-- Check if RLS is enabled on storage.objects
-- SELECT tablename, rowsecurity FROM pg_tables 
-- WHERE schemaname = 'storage' AND tablename = 'objects';

-- Count storage policies
-- SELECT COUNT(*) FROM pg_policies 
-- WHERE schemaname = 'storage' AND tablename = 'objects';

-- List all storage policies
-- SELECT policyname, cmd, qual, with_check 
-- FROM pg_policies 
-- WHERE schemaname = 'storage' AND tablename = 'objects'
-- ORDER BY policyname;
