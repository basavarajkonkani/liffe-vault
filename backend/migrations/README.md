# Database Migrations

This directory contains SQL migration files for the LifeVault database schema.

## Quick Start

**Before running migrations:**
```bash
# Test your Supabase connection
node migrations/test_connection.js
```

**To run the migration:**
1. Open Supabase Dashboard → SQL Editor
2. Copy `001_initial_schema.sql` contents
3. Paste and run
4. Verify with `verify_schema.sql`

**For detailed instructions:** See `EXECUTION_GUIDE.md`  
**For verification checklist:** See `MIGRATION_CHECKLIST.md`  
**For overview:** See `SUMMARY.md`

## Running Migrations

### Option 1: Supabase Dashboard (Recommended)

1. Log in to your Supabase project dashboard at https://app.supabase.com
2. Navigate to the **SQL Editor** section in the left sidebar
3. Click **New Query**
4. Copy the contents of `001_initial_schema.sql`
5. Paste into the SQL editor
6. Click **Run** to execute the migration
7. Verify tables are created in the **Table Editor** section

### Option 2: Supabase CLI

If you have the Supabase CLI installed:

```bash
# Make sure you're in the backend directory
cd backend

# Run the migration
supabase db push --db-url "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

### Option 3: psql Command Line

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres" -f migrations/001_initial_schema.sql
```

## Migration Files

### Schema Migrations
- `001_initial_schema.sql` - Initial database schema with all tables, indexes, and constraints
- `002_rls_policies.sql` - Row Level Security policies for all tables
- `003_storage_buckets.sql` - Storage bucket and RLS policies for file storage

### Verification Scripts
- `verify_schema.sql` - Verify schema migration (001)
- `verify_rls_policies.sql` - Verify RLS policies (002)
- `verify_storage_policies.sql` - Verify storage policies (003)
- `test_rls_policies.sql` - RLS testing documentation and scenarios

### Rollback Scripts
- `rollback_001.sql` - Rollback schema migration
- `rollback_002.sql` - Rollback RLS policies
- `rollback_003.sql` - Rollback storage policies

### Helper Scripts
- `test_connection.js` - Test Supabase connection
- `apply_rls_migration.js` - Apply RLS migration via Node.js
- `apply_storage_migration.js` - Apply storage migration via Node.js

## Verification

After running the migration, verify the following tables exist:

- ✅ `users` - User accounts with roles and PIN hashes
- ✅ `assets` - Digital assets owned by users
- ✅ `documents` - Document metadata
- ✅ `nominees` - Nominee user records
- ✅ `linked_nominees` - Asset-nominee relationships

Check that indexes are created:

- ✅ `idx_assets_owner_id`
- ✅ `idx_documents_asset_id`
- ✅ `idx_nominees_user_id`
- ✅ `idx_linked_nominees_asset_id`
- ✅ `idx_linked_nominees_nominee_id`

## Rollback

To rollback this migration, run:

```sql
DROP TABLE IF EXISTS linked_nominees CASCADE;
DROP TABLE IF EXISTS nominees CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
```

## Row Level Security (RLS)

After the initial schema is created, apply RLS policies:

### Apply RLS Policies

**Option 1: Supabase Dashboard (Recommended)**
1. Open Supabase Dashboard → SQL Editor
2. Copy `002_rls_policies.sql` contents
3. Paste and run
4. Verify with `verify_rls_policies.sql`

**Option 2: Node.js Script**
```bash
node migrations/apply_rls_migration.js
```

**For detailed RLS setup:** See `RLS_SETUP_GUIDE.md`

### RLS Policy Summary

The RLS policies enforce:
- **Owners** can manage their own assets (CRUD)
- **Nominees** can view shared assets (read-only)
- **Admins** can view all data (read-only)

Total of 27 policies across 5 tables.

## Storage Buckets (Migration 003)

After RLS policies are applied, set up Supabase Storage:

### Create Storage Bucket

**Option 1: Supabase Dashboard (Recommended)**
1. Open Supabase Dashboard → Storage
2. Click "New bucket"
3. Name: `documents`, Public: ❌ Unchecked, File size limit: `52428800`
4. Click "Create bucket"

**Option 2: Node.js Script**
```bash
node migrations/apply_storage_migration.js
```

### Apply Storage RLS Policies

1. Open Supabase Dashboard → SQL Editor
2. Copy `003_storage_buckets.sql` contents
3. Paste and run
4. Verify with `verify_storage_policies.sql`

**For detailed storage setup:** See `STORAGE_SETUP_GUIDE.md`  
**For storage testing:** See `STORAGE_TESTING_GUIDE.md`

### Storage Policy Summary

The storage policies enforce:
- **Owners** can upload/download/delete their own documents
- **Nominees** can download shared documents (read-only)
- **Admins** can access all documents

Total of 7 storage policies on storage.objects table.

## Next Steps

After running migrations:

1. ✅ Run `001_initial_schema.sql` - Create tables
2. ✅ Run `002_rls_policies.sql` - Apply RLS policies
3. ✅ Run `003_storage_buckets.sql` - Create storage bucket and policies
4. → Test with backend API (task 43)
5. → Connect frontend to backend (task 44)
