-- LifeVault Storage Verification Script
-- Purpose: Verify Supabase Storage bucket and RLS policies are correctly configured

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- 1. Check if 'documents' bucket exists
SELECT 
  '✓ Bucket Exists' as check_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'documents') 
    THEN '✓ PASS' 
    ELSE '✗ FAIL' 
  END as status,
  'documents bucket should exist' as description;

-- 2. Verify bucket is private (not public)
SELECT 
  '✓ Bucket is Private' as check_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'documents' AND public = false) 
    THEN '✓ PASS' 
    ELSE '✗ FAIL' 
  END as status,
  'documents bucket should be private (public = false)' as description;

-- 3. Verify file size limit is 50 MB
SELECT 
  '✓ File Size Limit' as check_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'documents' AND file_size_limit = 52428800) 
    THEN '✓ PASS' 
    ELSE '✗ FAIL' 
  END as status,
  'File size limit should be 52428800 bytes (50 MB)' as description;

-- 4. Check if RLS is enabled on storage.objects
SELECT 
  '✓ RLS Enabled on storage.objects' as check_name,
  CASE 
    WHEN (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'storage' AND tablename = 'objects') = true 
    THEN '✓ PASS' 
    ELSE '✗ FAIL' 
  END as status,
  'RLS should be enabled on storage.objects table' as description;

-- 5. Count storage policies (should be at least 7)
SELECT 
  '✓ Storage Policies Count' as check_name,
  CASE 
    WHEN (
      SELECT COUNT(*) FROM pg_policies 
      WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname IN (
        'owners_upload_to_own_assets',
        'owners_download_own_documents',
        'nominees_download_shared_documents',
        'admins_download_all_documents',
        'owners_delete_own_documents',
        'admins_delete_all_documents',
        'owners_update_own_documents'
      )
    ) = 7 
    THEN '✓ PASS' 
    ELSE '✗ FAIL' 
  END as status,
  'Should have 7 storage policies' as description;

-- 6. Verify upload policy exists
SELECT 
  '✓ Upload Policy' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'storage' 
      AND tablename = 'objects'
      AND policyname = 'owners_upload_to_own_assets'
      AND cmd = 'INSERT'
    ) 
    THEN '✓ PASS' 
    ELSE '✗ FAIL' 
  END as status,
  'owners_upload_to_own_assets policy should exist for INSERT' as description;

-- 7. Verify owner download policy exists
SELECT 
  '✓ Owner Download Policy' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'storage' 
      AND tablename = 'objects'
      AND policyname = 'owners_download_own_documents'
      AND cmd = 'SELECT'
    ) 
    THEN '✓ PASS' 
    ELSE '✗ FAIL' 
  END as status,
  'owners_download_own_documents policy should exist for SELECT' as description;

-- 8. Verify nominee download policy exists
SELECT 
  '✓ Nominee Download Policy' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'storage' 
      AND tablename = 'objects'
      AND policyname = 'nominees_download_shared_documents'
      AND cmd = 'SELECT'
    ) 
    THEN '✓ PASS' 
    ELSE '✗ FAIL' 
  END as status,
  'nominees_download_shared_documents policy should exist for SELECT' as description;

-- 9. Verify admin download policy exists
SELECT 
  '✓ Admin Download Policy' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'storage' 
      AND tablename = 'objects'
      AND policyname = 'admins_download_all_documents'
      AND cmd = 'SELECT'
    ) 
    THEN '✓ PASS' 
    ELSE '✗ FAIL' 
  END as status,
  'admins_download_all_documents policy should exist for SELECT' as description;

-- 10. Verify owner delete policy exists
SELECT 
  '✓ Owner Delete Policy' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'storage' 
      AND tablename = 'objects'
      AND policyname = 'owners_delete_own_documents'
      AND cmd = 'DELETE'
    ) 
    THEN '✓ PASS' 
    ELSE '✗ FAIL' 
  END as status,
  'owners_delete_own_documents policy should exist for DELETE' as description;

-- ============================================================================
-- DETAILED INFORMATION
-- ============================================================================

-- Show bucket details
SELECT 
  '=== BUCKET DETAILS ===' as section,
  id,
  name,
  public,
  file_size_limit,
  file_size_limit / 1024 / 1024 as size_limit_mb,
  created_at
FROM storage.buckets 
WHERE id = 'documents';

-- Show all storage policies
SELECT 
  '=== STORAGE POLICIES ===' as section,
  policyname,
  cmd as operation,
  CASE 
    WHEN qual IS NOT NULL THEN 'Yes'
    ELSE 'No'
  END as has_using_clause,
  CASE 
    WHEN with_check IS NOT NULL THEN 'Yes'
    ELSE 'No'
  END as has_check_clause
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
AND policyname IN (
  'owners_upload_to_own_assets',
  'owners_download_own_documents',
  'nominees_download_shared_documents',
  'admins_download_all_documents',
  'owners_delete_own_documents',
  'admins_delete_all_documents',
  'owners_update_own_documents'
)
ORDER BY policyname;

-- Show RLS status
SELECT 
  '=== RLS STATUS ===' as section,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- Count files in bucket (if any)
SELECT 
  '=== FILE COUNT ===' as section,
  bucket_id,
  COUNT(*) as total_files,
  SUM(metadata->>'size')::bigint as total_size_bytes,
  ROUND(SUM((metadata->>'size')::bigint) / 1024.0 / 1024.0, 2) as total_size_mb
FROM storage.objects 
WHERE bucket_id = 'documents'
GROUP BY bucket_id;

-- ============================================================================
-- SUMMARY
-- ============================================================================

SELECT 
  '=== VERIFICATION SUMMARY ===' as section,
  (
    SELECT COUNT(*) FROM (
      SELECT CASE WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'documents') THEN 1 ELSE 0 END
      UNION ALL
      SELECT CASE WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'documents' AND public = false) THEN 1 ELSE 0 END
      UNION ALL
      SELECT CASE WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'documents' AND file_size_limit = 52428800) THEN 1 ELSE 0 END
      UNION ALL
      SELECT CASE WHEN (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'storage' AND tablename = 'objects') = true THEN 1 ELSE 0 END
      UNION ALL
      SELECT CASE WHEN (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname IN ('owners_upload_to_own_assets', 'owners_download_own_documents', 'nominees_download_shared_documents', 'admins_download_all_documents', 'owners_delete_own_documents', 'admins_delete_all_documents', 'owners_update_own_documents')) = 7 THEN 1 ELSE 0 END
    ) checks WHERE checks.case = 1
  ) as checks_passed,
  5 as total_checks,
  CASE 
    WHEN (
      SELECT COUNT(*) FROM (
        SELECT CASE WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'documents') THEN 1 ELSE 0 END
        UNION ALL
        SELECT CASE WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'documents' AND public = false) THEN 1 ELSE 0 END
        UNION ALL
        SELECT CASE WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'documents' AND file_size_limit = 52428800) THEN 1 ELSE 0 END
        UNION ALL
        SELECT CASE WHEN (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'storage' AND tablename = 'objects') = true THEN 1 ELSE 0 END
        UNION ALL
        SELECT CASE WHEN (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname IN ('owners_upload_to_own_assets', 'owners_download_own_documents', 'nominees_download_shared_documents', 'admins_download_all_documents', 'owners_delete_own_documents', 'admins_delete_all_documents', 'owners_update_own_documents')) = 7 THEN 1 ELSE 0 END
      ) checks WHERE checks.case = 1
    ) = 5 
    THEN '✓ ALL CHECKS PASSED' 
    ELSE '✗ SOME CHECKS FAILED' 
  END as status;
