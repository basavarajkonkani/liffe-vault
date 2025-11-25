-- LifeVault RLS Policy Verification Script
-- This script verifies that all RLS policies are correctly applied

-- ============================================================================
-- CHECK RLS IS ENABLED ON ALL TABLES
-- ============================================================================

SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'assets', 'documents', 'nominees', 'linked_nominees')
ORDER BY tablename;

-- Expected output: All tables should have rls_enabled = true

-- ============================================================================
-- LIST ALL POLICIES BY TABLE
-- ============================================================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('users', 'assets', 'documents', 'nominees', 'linked_nominees')
ORDER BY tablename, policyname;

-- ============================================================================
-- COUNT POLICIES PER TABLE
-- ============================================================================

SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('users', 'assets', 'documents', 'nominees', 'linked_nominees')
GROUP BY tablename
ORDER BY tablename;

-- Expected counts:
-- users: 5 policies (select_own, update_own, select_admin, update_admin, insert_own)
-- assets: 6 policies (select_owner, select_nominee, select_admin, insert_owner, update_owner, delete_owner)
-- documents: 4 policies (select_accessible, insert_owner, update_owner, delete_owner)
-- nominees: 5 policies (select_own, select_owners, select_admin, insert_own, insert_admin)
-- linked_nominees: 7 policies (select_owner, select_nominee, select_admin, insert_owner, delete_owner, insert_admin, delete_admin)

-- ============================================================================
-- VERIFY SPECIFIC POLICIES EXIST
-- ============================================================================

-- Check critical policies exist
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'users_select_own') 
    THEN '✓ users_select_own exists'
    ELSE '✗ users_select_own MISSING'
  END as users_own_profile,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'users_select_admin') 
    THEN '✓ users_select_admin exists'
    ELSE '✗ users_select_admin MISSING'
  END as users_admin_view,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'assets' AND policyname = 'assets_select_owner') 
    THEN '✓ assets_select_owner exists'
    ELSE '✗ assets_select_owner MISSING'
  END as assets_owner_view,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'assets' AND policyname = 'assets_select_nominee') 
    THEN '✓ assets_select_nominee exists'
    ELSE '✗ assets_select_nominee MISSING'
  END as assets_nominee_view,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'assets' AND policyname = 'assets_select_admin') 
    THEN '✓ assets_select_admin exists'
    ELSE '✗ assets_select_admin MISSING'
  END as assets_admin_view,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'documents' AND policyname = 'documents_select_accessible') 
    THEN '✓ documents_select_accessible exists'
    ELSE '✗ documents_select_accessible MISSING'
  END as documents_access,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'linked_nominees' AND policyname = 'linked_nominees_insert_owner') 
    THEN '✓ linked_nominees_insert_owner exists'
    ELSE '✗ linked_nominees_insert_owner MISSING'
  END as nominee_linking;

-- ============================================================================
-- SUMMARY
-- ============================================================================

SELECT 
  'RLS Verification Complete' as status,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' 
   AND tablename IN ('users', 'assets', 'documents', 'nominees', 'linked_nominees')) as total_policies,
  (SELECT COUNT(DISTINCT tablename) FROM pg_policies WHERE schemaname = 'public' 
   AND tablename IN ('users', 'assets', 'documents', 'nominees', 'linked_nominees')) as tables_with_policies;

-- Expected: total_policies = 27, tables_with_policies = 5
