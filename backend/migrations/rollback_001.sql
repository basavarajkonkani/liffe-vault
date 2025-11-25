-- Rollback script for migration 001_initial_schema.sql
-- WARNING: This will delete all data in the LifeVault tables
-- Use with caution!

-- Drop triggers first
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_assets_updated_at ON assets;

-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS linked_nominees CASCADE;
DROP TABLE IF EXISTS nominees CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop the trigger function
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Verify cleanup
SELECT 
  'Rollback Complete' as status,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ All tables removed successfully'
    ELSE '⚠️  WARNING - ' || COUNT(*) || ' tables still exist'
  END as result
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'assets', 'documents', 'nominees', 'linked_nominees');
