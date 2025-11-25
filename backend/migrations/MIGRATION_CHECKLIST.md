# Database Migration Checklist

Use this checklist to ensure all steps are completed correctly.

## Pre-Migration Checklist

- [ ] Supabase project is created and active
- [ ] You have access to Supabase dashboard
- [ ] SUPABASE_URL is set in backend/.env
- [ ] SUPABASE_SERVICE_KEY is set in backend/.env
- [ ] Connection test passed: `node migrations/test_connection.js`
- [ ] Backup of existing data (if any) is created
- [ ] You have reviewed the migration SQL file

## Migration Execution Checklist

- [ ] Opened Supabase Dashboard (https://app.supabase.com)
- [ ] Navigated to SQL Editor
- [ ] Created new query
- [ ] Copied contents of `001_initial_schema.sql`
- [ ] Pasted into SQL Editor
- [ ] Reviewed SQL before execution
- [ ] Clicked Run button
- [ ] Received success message
- [ ] No error messages displayed

## Post-Migration Verification Checklist

### Table Verification
- [ ] `users` table exists in Table Editor
- [ ] `assets` table exists in Table Editor
- [ ] `documents` table exists in Table Editor
- [ ] `nominees` table exists in Table Editor
- [ ] `linked_nominees` table exists in Table Editor

### Column Verification (users table)
- [ ] id (uuid, primary key)
- [ ] email (text, unique, not null)
- [ ] role (text, not null, CHECK constraint)
- [ ] pin_hash (text, not null)
- [ ] created_at (timestamptz)
- [ ] updated_at (timestamptz)

### Column Verification (assets table)
- [ ] id (uuid, primary key)
- [ ] owner_id (uuid, foreign key to users)
- [ ] title (text, not null)
- [ ] category (text, not null, CHECK constraint)
- [ ] created_at (timestamptz)
- [ ] updated_at (timestamptz)

### Column Verification (documents table)
- [ ] id (uuid, primary key)
- [ ] asset_id (uuid, foreign key to assets)
- [ ] file_name (text, not null)
- [ ] file_path (text, not null)
- [ ] file_size (bigint, not null)
- [ ] uploaded_at (timestamptz)

### Column Verification (nominees table)
- [ ] id (uuid, primary key)
- [ ] user_id (uuid, foreign key to users, unique)
- [ ] created_at (timestamptz)

### Column Verification (linked_nominees table)
- [ ] id (uuid, primary key)
- [ ] asset_id (uuid, foreign key to assets)
- [ ] nominee_id (uuid, foreign key to nominees)
- [ ] linked_at (timestamptz)
- [ ] Unique constraint on (asset_id, nominee_id)

### Index Verification
- [ ] idx_assets_owner_id exists
- [ ] idx_documents_asset_id exists
- [ ] idx_nominees_user_id exists
- [ ] idx_linked_nominees_asset_id exists
- [ ] idx_linked_nominees_nominee_id exists

### Constraint Verification
- [ ] Foreign key: users.id → auth.users(id) with CASCADE
- [ ] Foreign key: assets.owner_id → users(id) with CASCADE
- [ ] Foreign key: documents.asset_id → assets(id) with CASCADE
- [ ] Foreign key: nominees.user_id → users(id) with CASCADE
- [ ] Foreign key: linked_nominees.asset_id → assets(id) with CASCADE
- [ ] Foreign key: linked_nominees.nominee_id → nominees(id) with CASCADE
- [ ] CHECK constraint: users.role IN ('owner', 'nominee', 'admin')
- [ ] CHECK constraint: assets.category IN ('Legal', 'Financial', 'Medical', 'Personal', 'Other')

### Trigger Verification
- [ ] update_users_updated_at trigger exists
- [ ] update_assets_updated_at trigger exists
- [ ] update_updated_at_column() function exists

### Verification Script
- [ ] Ran `verify_schema.sql` in SQL Editor
- [ ] All checks passed (✅)
- [ ] No warnings or errors

## Testing Checklist

### Basic Insert Test
- [ ] Can insert a test user record
- [ ] Can insert a test asset record
- [ ] Can insert a test document record
- [ ] Can insert a test nominee record
- [ ] Can insert a test linked_nominee record

### Cascade Delete Test
- [ ] Deleting a user cascades to their assets
- [ ] Deleting an asset cascades to its documents
- [ ] Deleting an asset cascades to its linked_nominees
- [ ] Deleting a nominee cascades to their linked_nominees

### Constraint Test
- [ ] Cannot insert user with invalid role
- [ ] Cannot insert asset with invalid category
- [ ] Cannot insert duplicate email in users
- [ ] Cannot insert duplicate user_id in nominees
- [ ] Cannot insert duplicate (asset_id, nominee_id) in linked_nominees

### Timestamp Test
- [ ] created_at is automatically set on insert
- [ ] updated_at is automatically set on insert
- [ ] updated_at is automatically updated on update

## Documentation Checklist

- [ ] Migration files are documented
- [ ] README.md is updated with migration info
- [ ] EXECUTION_GUIDE.md is available for team
- [ ] Rollback procedure is documented
- [ ] Verification procedure is documented

## Next Steps Checklist

After successful migration:

- [ ] Task 41: Implement Row Level Security (RLS) policies
- [ ] Task 42: Create Supabase Storage buckets and policies
- [ ] Task 43: Connect backend to Supabase and test endpoints
- [ ] Update backend services to use new schema
- [ ] Test authentication flow with database
- [ ] Test asset CRUD operations
- [ ] Test document upload/download
- [ ] Test nominee linking

## Rollback Checklist (if needed)

- [ ] Backup any important data
- [ ] Run `rollback_001.sql` in SQL Editor
- [ ] Verify all tables are removed
- [ ] Document reason for rollback
- [ ] Fix issues in migration script
- [ ] Re-run migration after fixes

## Sign-off

- [ ] Migration completed successfully
- [ ] All verification checks passed
- [ ] Team notified of completion
- [ ] Documentation updated
- [ ] Ready to proceed to next task

**Completed by:** _______________  
**Date:** _______________  
**Notes:** _______________
