-- LifeVault Database Migration
-- Version: 002
-- Description: Row Level Security (RLS) policies for all tables

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE nominees ENABLE ROW LEVEL SECURITY;
ALTER TABLE linked_nominees ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Policy: Users can view their own profile
CREATE POLICY "users_select_own"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "users_update_own"
  ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Admins can view all users
CREATE POLICY "users_select_admin"
  ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins can update any user
CREATE POLICY "users_update_admin"
  ON users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Allow user creation during registration (INSERT)
CREATE POLICY "users_insert_own"
  ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- ASSETS TABLE POLICIES
-- ============================================================================

-- Policy: Owners can view their own assets
CREATE POLICY "assets_select_owner"
  ON assets
  FOR SELECT
  USING (owner_id = auth.uid());

-- Policy: Nominees can view assets shared with them
CREATE POLICY "assets_select_nominee"
  ON assets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 
      FROM linked_nominees ln
      JOIN nominees n ON ln.nominee_id = n.id
      WHERE ln.asset_id = assets.id 
        AND n.user_id = auth.uid()
    )
  );

-- Policy: Admins can view all assets
CREATE POLICY "assets_select_admin"
  ON assets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Owners can insert their own assets
CREATE POLICY "assets_insert_owner"
  ON assets
  FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Policy: Owners can update their own assets
CREATE POLICY "assets_update_owner"
  ON assets
  FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Policy: Owners can delete their own assets
CREATE POLICY "assets_delete_owner"
  ON assets
  FOR DELETE
  USING (owner_id = auth.uid());

-- ============================================================================
-- DOCUMENTS TABLE POLICIES
-- ============================================================================

-- Policy: Users can view documents of accessible assets
-- (Owners see their own, Nominees see shared, Admins see all)
CREATE POLICY "documents_select_accessible"
  ON documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assets 
      WHERE id = documents.asset_id
        AND (
          -- Owner can see their own documents
          owner_id = auth.uid()
          -- Nominee can see documents of shared assets
          OR EXISTS (
            SELECT 1 
            FROM linked_nominees ln
            JOIN nominees n ON ln.nominee_id = n.id
            WHERE ln.asset_id = assets.id 
              AND n.user_id = auth.uid()
          )
          -- Admin can see all documents
          OR EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
          )
        )
    )
  );

-- Policy: Owners can insert documents to their own assets
CREATE POLICY "documents_insert_owner"
  ON documents
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM assets 
      WHERE id = documents.asset_id 
        AND owner_id = auth.uid()
    )
  );

-- Policy: Owners can update documents in their own assets
CREATE POLICY "documents_update_owner"
  ON documents
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM assets 
      WHERE id = documents.asset_id 
        AND owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM assets 
      WHERE id = documents.asset_id 
        AND owner_id = auth.uid()
    )
  );

-- Policy: Owners can delete documents from their own assets
CREATE POLICY "documents_delete_owner"
  ON documents
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM assets 
      WHERE id = documents.asset_id 
        AND owner_id = auth.uid()
    )
  );

-- ============================================================================
-- NOMINEES TABLE POLICIES
-- ============================================================================

-- Policy: Users can view their own nominee record
CREATE POLICY "nominees_select_own"
  ON nominees
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Asset owners can view all nominees (for linking purposes)
CREATE POLICY "nominees_select_owners"
  ON nominees
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- Policy: Admins can view all nominees
CREATE POLICY "nominees_select_admin"
  ON nominees
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Users can create their own nominee record
CREATE POLICY "nominees_insert_own"
  ON nominees
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy: Admins can create nominee records
CREATE POLICY "nominees_insert_admin"
  ON nominees
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- LINKED_NOMINEES TABLE POLICIES
-- ============================================================================

-- Policy: Asset owners can view nominee links for their assets
CREATE POLICY "linked_nominees_select_owner"
  ON linked_nominees
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assets 
      WHERE id = linked_nominees.asset_id 
        AND owner_id = auth.uid()
    )
  );

-- Policy: Nominees can view their own links
CREATE POLICY "linked_nominees_select_nominee"
  ON linked_nominees
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM nominees 
      WHERE id = linked_nominees.nominee_id 
        AND user_id = auth.uid()
    )
  );

-- Policy: Admins can view all nominee links
CREATE POLICY "linked_nominees_select_admin"
  ON linked_nominees
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Asset owners can link nominees to their assets
CREATE POLICY "linked_nominees_insert_owner"
  ON linked_nominees
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM assets 
      WHERE id = linked_nominees.asset_id 
        AND owner_id = auth.uid()
    )
  );

-- Policy: Asset owners can unlink nominees from their assets
CREATE POLICY "linked_nominees_delete_owner"
  ON linked_nominees
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM assets 
      WHERE id = linked_nominees.asset_id 
        AND owner_id = auth.uid()
    )
  );

-- Policy: Admins can manage all nominee links
CREATE POLICY "linked_nominees_insert_admin"
  ON linked_nominees
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "linked_nominees_delete_admin"
  ON linked_nominees
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON POLICY "users_select_own" ON users IS 'Users can view their own profile';
COMMENT ON POLICY "users_select_admin" ON users IS 'Admins can view all user profiles';
COMMENT ON POLICY "assets_select_owner" ON assets IS 'Asset owners can view their own assets';
COMMENT ON POLICY "assets_select_nominee" ON assets IS 'Nominees can view assets shared with them';
COMMENT ON POLICY "assets_select_admin" ON assets IS 'Admins can view all assets';
COMMENT ON POLICY "documents_select_accessible" ON documents IS 'Users can view documents based on asset access rights';
COMMENT ON POLICY "linked_nominees_insert_owner" ON linked_nominees IS 'Asset owners can link nominees to their assets';
COMMENT ON POLICY "linked_nominees_delete_owner" ON linked_nominees IS 'Asset owners can unlink nominees from their assets';
