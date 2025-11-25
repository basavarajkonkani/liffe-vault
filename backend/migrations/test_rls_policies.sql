-- LifeVault RLS Policy Testing Script
-- This script provides test scenarios for different user roles
-- NOTE: This script is for documentation purposes. Actual testing should be done
-- through the application with real authenticated users.

-- ============================================================================
-- TEST SCENARIO DOCUMENTATION
-- ============================================================================

/*
TESTING APPROACH:
-----------------
RLS policies are enforced at the database level based on auth.uid().
To properly test these policies, you need to:

1. Create test users through Supabase Auth
2. Authenticate as each user to get their JWT token
3. Use the Supabase client with the JWT token to make queries
4. Verify that each user can only access data according to their role

MANUAL TESTING STEPS:
---------------------

TEST 1: Asset Owner Access
---------------------------
1. Create an owner user and authenticate
2. Create an asset for this owner
3. Verify owner can:
   - View their own assets (SELECT)
   - Update their own assets (UPDATE)
   - Delete their own assets (DELETE)
   - Upload documents to their assets (INSERT on documents)
4. Verify owner cannot:
   - View other owners' assets
   - Modify other owners' assets

TEST 2: Nominee Access
----------------------
1. Create a nominee user and authenticate
2. Link the nominee to an asset owned by another user
3. Verify nominee can:
   - View assets shared with them (SELECT on assets)
   - View documents of shared assets (SELECT on documents)
   - Download documents from shared assets
4. Verify nominee cannot:
   - View assets not shared with them
   - Upload documents to shared assets
   - Modify or delete shared assets
   - Unlink themselves from assets

TEST 3: Admin Access
--------------------
1. Create an admin user and authenticate
2. Verify admin can:
   - View all users (SELECT on users)
   - View all assets (SELECT on assets)
   - View all documents (SELECT on documents)
   - View all nominee links (SELECT on linked_nominees)
3. Verify admin cannot:
   - Modify assets owned by other users (by design)
   - Delete assets owned by other users (by design)

TEST 4: Cross-Role Scenarios
-----------------------------
1. Owner A creates an asset
2. Owner A links Nominee B to the asset
3. Verify:
   - Owner A can see the asset
   - Nominee B can see the asset
   - Owner C cannot see the asset
   - Admin can see the asset
4. Owner A unlinks Nominee B
5. Verify:
   - Nominee B can no longer see the asset

TEST 5: Document Access
-----------------------
1. Owner uploads a document to their asset
2. Owner links a nominee to the asset
3. Verify:
   - Owner can view and download the document
   - Nominee can view and download the document
   - Other users cannot view the document
   - Admin can view the document
4. Owner unlinks the nominee
5. Verify:
   - Nominee can no longer view the document

*/

-- ============================================================================
-- HELPER QUERIES FOR TESTING
-- ============================================================================

-- Query to check current authenticated user
-- Run this after authenticating to verify auth.uid()
SELECT 
  auth.uid() as current_user_id,
  u.email,
  u.role
FROM users u
WHERE u.id = auth.uid();

-- Query to list all assets accessible to current user
-- This should respect RLS policies
SELECT 
  a.id,
  a.title,
  a.category,
  a.owner_id,
  u.email as owner_email,
  CASE 
    WHEN a.owner_id = auth.uid() THEN 'Owner'
    WHEN EXISTS (
      SELECT 1 FROM linked_nominees ln
      JOIN nominees n ON ln.nominee_id = n.id
      WHERE ln.asset_id = a.id AND n.user_id = auth.uid()
    ) THEN 'Nominee'
    ELSE 'Admin'
  END as access_type
FROM assets a
JOIN users u ON a.owner_id = u.id
ORDER BY a.created_at DESC;

-- Query to list all documents accessible to current user
-- This should respect RLS policies
SELECT 
  d.id,
  d.file_name,
  d.file_size,
  d.uploaded_at,
  a.title as asset_title,
  a.owner_id,
  u.email as owner_email
FROM documents d
JOIN assets a ON d.asset_id = a.id
JOIN users u ON a.owner_id = u.id
ORDER BY d.uploaded_at DESC;

-- Query to list nominee links for current user's assets (owners only)
SELECT 
  ln.id,
  a.title as asset_title,
  u.email as nominee_email,
  ln.linked_at
FROM linked_nominees ln
JOIN assets a ON ln.asset_id = a.id
JOIN nominees n ON ln.nominee_id = n.id
JOIN users u ON n.user_id = u.id
ORDER BY ln.linked_at DESC;

-- ============================================================================
-- EXPECTED BEHAVIOR SUMMARY
-- ============================================================================

/*
POLICY ENFORCEMENT SUMMARY:
---------------------------

USERS TABLE:
- Users can SELECT their own profile
- Users can UPDATE their own profile
- Admins can SELECT all profiles
- Admins can UPDATE all profiles
- Users can INSERT their own profile during registration

ASSETS TABLE:
- Owners can SELECT/INSERT/UPDATE/DELETE their own assets
- Nominees can SELECT assets shared with them (read-only)
- Admins can SELECT all assets (read-only)

DOCUMENTS TABLE:
- Owners can SELECT/INSERT/UPDATE/DELETE documents in their assets
- Nominees can SELECT documents in shared assets (read-only)
- Admins can SELECT all documents (read-only)

NOMINEES TABLE:
- Users can SELECT their own nominee record
- Owners can SELECT all nominees (for linking purposes)
- Admins can SELECT all nominees
- Users can INSERT their own nominee record
- Admins can INSERT nominee records

LINKED_NOMINEES TABLE:
- Owners can SELECT/INSERT/DELETE links for their assets
- Nominees can SELECT their own links
- Admins can SELECT/INSERT/DELETE all links

*/

-- ============================================================================
-- TESTING WITH SUPABASE CLIENT (JavaScript/TypeScript)
-- ============================================================================

/*
Example test code using Supabase client:

// Test as Owner
const { data: ownerAssets, error: ownerError } = await supabase
  .from('assets')
  .select('*')
  .eq('owner_id', ownerUserId);

// Should return only assets owned by this user

// Test as Nominee
const { data: nomineeAssets, error: nomineeError } = await supabase
  .from('assets')
  .select('*');

// Should return only assets shared with this nominee

// Test as Admin
const { data: adminAssets, error: adminError } = await supabase
  .from('assets')
  .select('*');

// Should return all assets in the system

// Test unauthorized access
const { data: otherAssets, error: unauthorizedError } = await supabase
  .from('assets')
  .select('*')
  .eq('owner_id', differentOwnerId);

// Should return empty array or error for non-admin users

*/
