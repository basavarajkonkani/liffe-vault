-- LifeVault Database Migration Rollback
-- Version: 003
-- Description: Rollback storage bucket RLS policies

-- ============================================================================
-- DROP STORAGE RLS POLICIES
-- ============================================================================

-- Drop all storage policies in reverse order
DROP POLICY IF EXISTS "owners_update_own_documents" ON storage.objects;
DROP POLICY IF EXISTS "admins_delete_all_documents" ON storage.objects;
DROP POLICY IF EXISTS "owners_delete_own_documents" ON storage.objects;
DROP POLICY IF EXISTS "admins_download_all_documents" ON storage.objects;
DROP POLICY IF EXISTS "nominees_download_shared_documents" ON storage.objects;
DROP POLICY IF EXISTS "owners_download_own_documents" ON storage.objects;
DROP POLICY IF EXISTS "owners_upload_to_own_assets" ON storage.objects;

-- ============================================================================
-- DISABLE RLS ON STORAGE.OBJECTS (OPTIONAL - BE CAREFUL!)
-- ============================================================================

-- WARNING: Only disable RLS if you're sure you want to remove all access control
-- Uncomment the line below only if you want to completely disable storage RLS
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- DELETE STORAGE BUCKET (OPTIONAL - DESTRUCTIVE!)
-- ============================================================================

-- WARNING: This will delete all files in the bucket!
-- Only uncomment if you want to completely remove the bucket and all its contents
-- DELETE FROM storage.objects WHERE bucket_id = 'documents';
-- DELETE FROM storage.buckets WHERE id = 'documents';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify policies are dropped
SELECT COUNT(*) as remaining_storage_policies
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
AND policyname LIKE '%documents%' OR policyname LIKE '%owners%' OR policyname LIKE '%nominees%' OR policyname LIKE '%admins%';

-- Expected result: 0 (or only policies from other buckets)
