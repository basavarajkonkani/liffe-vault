-- LifeVault Database Migration Rollback
-- Version: 002
-- Description: Rollback Row Level Security (RLS) policies

-- ============================================================================
-- DROP ALL POLICIES
-- ============================================================================

-- Users table policies
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "users_select_admin" ON users;
DROP POLICY IF EXISTS "users_update_admin" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;

-- Assets table policies
DROP POLICY IF EXISTS "assets_select_owner" ON assets;
DROP POLICY IF EXISTS "assets_select_nominee" ON assets;
DROP POLICY IF EXISTS "assets_select_admin" ON assets;
DROP POLICY IF EXISTS "assets_insert_owner" ON assets;
DROP POLICY IF EXISTS "assets_update_owner" ON assets;
DROP POLICY IF EXISTS "assets_delete_owner" ON assets;

-- Documents table policies
DROP POLICY IF EXISTS "documents_select_accessible" ON documents;
DROP POLICY IF EXISTS "documents_insert_owner" ON documents;
DROP POLICY IF EXISTS "documents_update_owner" ON documents;
DROP POLICY IF EXISTS "documents_delete_owner" ON documents;

-- Nominees table policies
DROP POLICY IF EXISTS "nominees_select_own" ON nominees;
DROP POLICY IF EXISTS "nominees_select_owners" ON nominees;
DROP POLICY IF EXISTS "nominees_select_admin" ON nominees;
DROP POLICY IF EXISTS "nominees_insert_own" ON nominees;
DROP POLICY IF EXISTS "nominees_insert_admin" ON nominees;

-- Linked nominees table policies
DROP POLICY IF EXISTS "linked_nominees_select_owner" ON linked_nominees;
DROP POLICY IF EXISTS "linked_nominees_select_nominee" ON linked_nominees;
DROP POLICY IF EXISTS "linked_nominees_select_admin" ON linked_nominees;
DROP POLICY IF EXISTS "linked_nominees_insert_owner" ON linked_nominees;
DROP POLICY IF EXISTS "linked_nominees_delete_owner" ON linked_nominees;
DROP POLICY IF EXISTS "linked_nominees_insert_admin" ON linked_nominees;
DROP POLICY IF EXISTS "linked_nominees_delete_admin" ON linked_nominees;

-- ============================================================================
-- DISABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE assets DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE nominees DISABLE ROW LEVEL SECURITY;
ALTER TABLE linked_nominees DISABLE ROW LEVEL SECURITY;
