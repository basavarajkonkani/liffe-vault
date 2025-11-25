-- Verification script for LifeVault database schema
-- Run this after executing the migration to verify all tables and indexes exist

-- Check if all tables exist
SELECT 
  'Tables Check' as check_type,
  CASE 
    WHEN COUNT(*) = 5 THEN '✅ PASS - All 5 tables exist'
    ELSE '❌ FAIL - Expected 5 tables, found ' || COUNT(*)
  END as result
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'assets', 'documents', 'nominees', 'linked_nominees');

-- List all tables
SELECT 
  'Table List' as check_type,
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'assets', 'documents', 'nominees', 'linked_nominees')
ORDER BY table_name;

-- Check if all indexes exist
SELECT 
  'Indexes Check' as check_type,
  CASE 
    WHEN COUNT(*) >= 5 THEN '✅ PASS - All required indexes exist'
    ELSE '❌ FAIL - Expected at least 5 indexes, found ' || COUNT(*)
  END as result
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname IN (
    'idx_assets_owner_id',
    'idx_documents_asset_id',
    'idx_nominees_user_id',
    'idx_linked_nominees_asset_id',
    'idx_linked_nominees_nominee_id'
  );

-- List all indexes
SELECT 
  'Index List' as check_type,
  indexname,
  tablename
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Check foreign key constraints
SELECT 
  'Foreign Keys Check' as check_type,
  COUNT(*) as constraint_count,
  CASE 
    WHEN COUNT(*) >= 6 THEN '✅ PASS - Foreign key constraints exist'
    ELSE '⚠️  WARNING - Expected at least 6 foreign keys, found ' || COUNT(*)
  END as result
FROM information_schema.table_constraints 
WHERE constraint_schema = 'public' 
  AND constraint_type = 'FOREIGN KEY'
  AND table_name IN ('users', 'assets', 'documents', 'nominees', 'linked_nominees');

-- Check CHECK constraints for enums
SELECT 
  'CHECK Constraints' as check_type,
  table_name,
  constraint_name
FROM information_schema.table_constraints 
WHERE constraint_schema = 'public' 
  AND constraint_type = 'CHECK'
  AND table_name IN ('users', 'assets')
ORDER BY table_name;

-- Verify column data types
SELECT 
  'Column Types Check' as check_type,
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'assets', 'documents', 'nominees', 'linked_nominees')
ORDER BY table_name, ordinal_position;

-- Check if triggers exist
SELECT 
  'Triggers Check' as check_type,
  trigger_name,
  event_object_table as table_name,
  action_timing,
  event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
  AND trigger_name LIKE 'update_%_updated_at'
ORDER BY event_object_table;

-- Summary
SELECT 
  '=== VERIFICATION SUMMARY ===' as summary,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'assets', 'documents', 'nominees', 'linked_nominees')) as tables_created,
  (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%') as indexes_created,
  (SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_schema = 'public' AND constraint_type = 'FOREIGN KEY' AND table_name IN ('users', 'assets', 'documents', 'nominees', 'linked_nominees')) as foreign_keys_created,
  (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public' AND trigger_name LIKE 'update_%_updated_at') as triggers_created;
