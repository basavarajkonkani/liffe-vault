# Database Migration Execution Guide

This guide provides step-by-step instructions for running the LifeVault database migration.

## Prerequisites

- Access to your Supabase project dashboard
- Supabase project URL and credentials
- The migration file: `001_initial_schema.sql`

## Step-by-Step Execution

### Step 1: Access Supabase SQL Editor

1. Open your browser and navigate to https://app.supabase.com
2. Log in to your account
3. Select your LifeVault project
4. Click on **SQL Editor** in the left sidebar (database icon)

### Step 2: Create New Query

1. Click the **New Query** button (or press `Ctrl/Cmd + Enter`)
2. You'll see an empty SQL editor

### Step 3: Load Migration Script

1. Open the file `backend/migrations/001_initial_schema.sql` in your code editor
2. Copy the entire contents (Ctrl/Cmd + A, then Ctrl/Cmd + C)
3. Paste into the Supabase SQL Editor (Ctrl/Cmd + V)

### Step 4: Review the Migration

Before executing, review the SQL to ensure:
- ✅ All 5 tables will be created: users, assets, documents, nominees, linked_nominees
- ✅ Foreign key constraints with ON DELETE CASCADE are present
- ✅ CHECK constraints for role and category enums are included
- ✅ Indexes are created for performance
- ✅ Triggers for auto-updating timestamps are included

### Step 5: Execute Migration

1. Click the **Run** button (or press `Ctrl/Cmd + Enter`)
2. Wait for execution to complete (should take 1-2 seconds)
3. Check for success message: "Success. No rows returned"

### Step 6: Verify Tables Created

1. Click on **Table Editor** in the left sidebar
2. You should see the following tables:
   - `users`
   - `assets`
   - `documents`
   - `nominees`
   - `linked_nominees`

### Step 7: Run Verification Script

1. Go back to **SQL Editor**
2. Click **New Query**
3. Copy and paste the contents of `verify_schema.sql`
4. Click **Run**
5. Review the results to ensure all checks pass

Expected verification results:
```
✅ PASS - All 5 tables exist
✅ PASS - All required indexes exist
✅ PASS - Foreign key constraints exist
```

### Step 8: Inspect Table Structure

For each table, verify the structure:

#### Users Table
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
```

Expected columns:
- id (uuid, NOT NULL)
- email (text, NOT NULL)
- role (text, NOT NULL)
- pin_hash (text, NOT NULL)
- created_at (timestamp with time zone)
- updated_at (timestamp with time zone)

#### Assets Table
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'assets' 
ORDER BY ordinal_position;
```

Expected columns:
- id (uuid, NOT NULL)
- owner_id (uuid, NOT NULL)
- title (text, NOT NULL)
- category (text, NOT NULL)
- created_at (timestamp with time zone)
- updated_at (timestamp with time zone)

#### Documents Table
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'documents' 
ORDER BY ordinal_position;
```

Expected columns:
- id (uuid, NOT NULL)
- asset_id (uuid, NOT NULL)
- file_name (text, NOT NULL)
- file_path (text, NOT NULL)
- file_size (bigint, NOT NULL)
- uploaded_at (timestamp with time zone)

#### Nominees Table
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'nominees' 
ORDER BY ordinal_position;
```

Expected columns:
- id (uuid, NOT NULL)
- user_id (uuid, NOT NULL)
- created_at (timestamp with time zone)

#### Linked Nominees Table
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'linked_nominees' 
ORDER BY ordinal_position;
```

Expected columns:
- id (uuid, NOT NULL)
- asset_id (uuid, NOT NULL)
- nominee_id (uuid, NOT NULL)
- linked_at (timestamp with time zone)

### Step 9: Verify Indexes

Run this query to check indexes:
```sql
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```

Expected indexes:
- idx_assets_owner_id (on assets table)
- idx_documents_asset_id (on documents table)
- idx_nominees_user_id (on nominees table)
- idx_linked_nominees_asset_id (on linked_nominees table)
- idx_linked_nominees_nominee_id (on linked_nominees table)

### Step 10: Test Foreign Key Constraints

Test that CASCADE deletes work correctly:

```sql
-- This is just a test, don't run in production with real data
BEGIN;

-- Insert test user
INSERT INTO users (id, email, role, pin_hash) 
VALUES ('00000000-0000-0000-0000-000000000001', 'test@example.com', 'owner', 'test_hash');

-- Insert test asset
INSERT INTO assets (id, owner_id, title, category) 
VALUES ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Test Asset', 'Personal');

-- Insert test document
INSERT INTO documents (asset_id, file_name, file_path, file_size) 
VALUES ('00000000-0000-0000-0000-000000000002', 'test.pdf', '/test/test.pdf', 1024);

-- Verify inserts
SELECT COUNT(*) as user_count FROM users WHERE id = '00000000-0000-0000-0000-000000000001';
SELECT COUNT(*) as asset_count FROM assets WHERE id = '00000000-0000-0000-0000-000000000002';
SELECT COUNT(*) as document_count FROM documents WHERE asset_id = '00000000-0000-0000-0000-000000000002';

-- Delete user (should cascade to assets and documents)
DELETE FROM users WHERE id = '00000000-0000-0000-0000-000000000001';

-- Verify cascade delete worked
SELECT COUNT(*) as remaining_assets FROM assets WHERE id = '00000000-0000-0000-0000-000000000002';
SELECT COUNT(*) as remaining_documents FROM documents WHERE asset_id = '00000000-0000-0000-0000-000000000002';

ROLLBACK; -- Rollback the test
```

Both counts should be 0 after the delete, confirming CASCADE works.

## Troubleshooting

### Error: "relation already exists"

If you see this error, tables already exist. Options:
1. Skip migration if tables are correct
2. Run rollback script first: `rollback_001.sql`
3. Manually drop tables and re-run migration

### Error: "permission denied"

Ensure you're using the service role key or have proper database permissions.

### Error: "extension uuid-ossp does not exist"

The migration should create this automatically. If it fails, run manually:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Error: "foreign key constraint violation"

This shouldn't happen during initial migration. If it does, ensure you're running on a clean database.

## Next Steps

After successful migration:

1. ✅ **Task 41**: Implement Row Level Security (RLS) policies
2. ✅ **Task 42**: Create Supabase Storage buckets and policies
3. ✅ **Task 43**: Connect backend to Supabase and test endpoints

## Rollback Instructions

If you need to rollback this migration:

1. Go to SQL Editor in Supabase
2. Open `rollback_001.sql`
3. Copy and paste the contents
4. Click Run
5. Verify all tables are removed

**⚠️ WARNING**: Rollback will delete all data in these tables!

## Support

If you encounter issues:
1. Check Supabase logs in the dashboard
2. Review the error message carefully
3. Consult Supabase documentation: https://supabase.com/docs
4. Check the LifeVault design document for schema details
