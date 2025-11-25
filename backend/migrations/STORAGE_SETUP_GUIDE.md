# Supabase Storage Setup Guide

## Overview

This guide walks you through setting up the Supabase Storage bucket for LifeVault document storage with proper Row Level Security (RLS) policies.

## Prerequisites

- ✅ Supabase project created
- ✅ Database migrations 001 and 002 applied (tables and RLS policies)
- ✅ Supabase credentials configured in backend/.env

## Storage Architecture

### Bucket Structure

```
documents/ (bucket)
├── {asset_id_1}/
│   ├── {timestamp}_{filename1}.pdf
│   ├── {timestamp}_{filename2}.jpg
│   └── ...
├── {asset_id_2}/
│   ├── {timestamp}_{filename3}.docx
│   └── ...
└── ...
```

### File Path Format

```
{asset_id}/{timestamp}_{original_filename}
```

Example:
```
550e8400-e29b-41d4-a716-446655440000/1732492800000_passport.pdf
```

## Step 1: Create Storage Bucket

### Option A: Supabase Dashboard (Recommended)

1. **Navigate to Storage**
   - Open your Supabase project dashboard
   - Click on "Storage" in the left sidebar

2. **Create New Bucket**
   - Click "New bucket" button
   - Enter the following details:
     - **Name**: `documents`
     - **Public**: ❌ **Unchecked** (private bucket)
     - **File size limit**: `52428800` (50 MB in bytes)
     - **Allowed MIME types**: Leave empty (all types allowed, backend validates)

3. **Create Bucket**
   - Click "Create bucket"
   - Verify the bucket appears in the list

### Option B: SQL Editor

1. **Open SQL Editor**
   - Navigate to SQL Editor in Supabase Dashboard

2. **Run Bucket Creation**
   ```sql
   INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
   VALUES (
     'documents',
     'documents',
     false,
     52428800,
     NULL
   )
   ON CONFLICT (id) DO NOTHING;
   ```

3. **Verify Creation**
   ```sql
   SELECT * FROM storage.buckets WHERE id = 'documents';
   ```

### Option C: Supabase CLI

```bash
# Create bucket via CLI
supabase storage create documents --public=false --file-size-limit=52428800
```

## Step 2: Apply Storage RLS Policies

### Method 1: Supabase Dashboard SQL Editor

1. **Open SQL Editor**
   - Navigate to SQL Editor in Supabase Dashboard
   - Click "New query"

2. **Copy Migration SQL**
   - Open `backend/migrations/003_storage_buckets.sql`
   - Copy the entire contents

3. **Execute Migration**
   - Paste the SQL into the editor
   - Click "Run" or press Cmd/Ctrl + Enter
   - Wait for success confirmation

4. **Verify Policies**
   ```sql
   SELECT policyname, cmd 
   FROM pg_policies 
   WHERE schemaname = 'storage' AND tablename = 'objects'
   ORDER BY policyname;
   ```
   
   Expected: 7 policies created

### Method 2: Node.js Script

1. **Create Helper Script**
   ```bash
   cd backend
   node migrations/apply_storage_migration.js
   ```

2. **Verify Success**
   - Check console output for success messages
   - Verify no errors occurred

### Method 3: Supabase CLI

```bash
# Apply migration via CLI
supabase db push
```

## Step 3: Verify Storage Setup

### Verification Checklist

Run these queries in SQL Editor:

#### 1. Check Bucket Exists
```sql
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id = 'documents';
```

**Expected Result:**
```
id: documents
name: documents
public: false
file_size_limit: 52428800
```

#### 2. Check RLS is Enabled
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';
```

**Expected Result:**
```
tablename: objects
rowsecurity: true
```

#### 3. Count Storage Policies
```sql
SELECT COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';
```

**Expected Result:** At least 7 policies (may be more if other buckets exist)

#### 4. List All Storage Policies
```sql
SELECT policyname, cmd, qual IS NOT NULL as has_using, with_check IS NOT NULL as has_check
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
```

**Expected Result:** All 7 policies listed

## Step 4: Test Storage Access

### Test 1: Upload Document (Owner)

Use the backend API to test file upload:

```bash
# Create a test asset first
curl -X POST http://localhost:3000/assets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Asset",
    "category": "Personal"
  }'

# Upload a document to the asset
curl -X POST http://localhost:3000/assets/ASSET_ID/documents \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/test.pdf"
```

**Expected:** 
- ✅ File uploaded successfully
- ✅ Document record created in database
- ✅ File visible in Supabase Storage under `documents/ASSET_ID/`

### Test 2: Download Document (Owner)

```bash
# Get download URL
curl -X GET http://localhost:3000/documents/DOCUMENT_ID/download \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected:**
- ✅ Signed URL returned
- ✅ URL valid for 60 seconds
- ✅ File downloads successfully

### Test 3: Access Shared Document (Nominee)

```bash
# Link nominee to asset (as owner)
curl -X POST http://localhost:3000/nominees/link \
  -H "Authorization: Bearer OWNER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assetId": "ASSET_ID",
    "nomineeId": "NOMINEE_ID"
  }'

# Download document (as nominee)
curl -X GET http://localhost:3000/documents/DOCUMENT_ID/download \
  -H "Authorization: Bearer NOMINEE_JWT_TOKEN"
```

**Expected:**
- ✅ Nominee can download shared document
- ✅ Signed URL generated successfully

### Test 4: Unauthorized Access (Nominee to Unshared Asset)

```bash
# Try to download unshared document (as nominee)
curl -X GET http://localhost:3000/documents/UNSHARED_DOCUMENT_ID/download \
  -H "Authorization: Bearer NOMINEE_JWT_TOKEN"
```

**Expected:**
- ❌ Access denied (403 or 404)
- ❌ No signed URL generated

### Test 5: Admin Access

```bash
# Download any document (as admin)
curl -X GET http://localhost:3000/documents/ANY_DOCUMENT_ID/download \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected:**
- ✅ Admin can download any document
- ✅ Signed URL generated successfully

## Storage RLS Policies Explained

### Policy 1: owners_upload_to_own_assets
**Purpose:** Asset owners can upload documents to their asset folders

**Logic:**
- Checks if authenticated user exists
- Extracts asset_id from file path
- Verifies asset belongs to authenticated user

**Example Path:** `550e8400-e29b-41d4-a716-446655440000/file.pdf`

### Policy 2: owners_download_own_documents
**Purpose:** Asset owners can download their own documents

**Logic:**
- Checks if authenticated user exists
- Extracts asset_id from file path
- Verifies asset belongs to authenticated user

### Policy 3: nominees_download_shared_documents
**Purpose:** Nominees can download documents from shared assets

**Logic:**
- Checks if authenticated user exists
- Extracts asset_id from file path
- Verifies asset is linked to authenticated nominee via linked_nominees table

### Policy 4: admins_download_all_documents
**Purpose:** Admins can download any document

**Logic:**
- Checks if authenticated user exists
- Verifies user has 'admin' role

### Policy 5: owners_delete_own_documents
**Purpose:** Asset owners can delete their own documents

**Logic:**
- Same as download policy
- Only owners can delete

### Policy 6: admins_delete_all_documents
**Purpose:** Admins can delete any document for moderation

**Logic:**
- Same as admin download policy
- Allows moderation capabilities

### Policy 7: owners_update_own_documents
**Purpose:** Asset owners can update document metadata

**Logic:**
- Same as download policy
- Allows updating file metadata (not content)

## Security Considerations

### 1. Private Bucket
- ✅ Bucket is private (not publicly accessible)
- ✅ All access requires authentication
- ✅ RLS policies enforce authorization

### 2. File Size Limit
- ✅ 50 MB maximum file size
- ✅ Enforced at bucket level
- ✅ Additional validation in backend

### 3. Path-Based Access Control
- ✅ Files organized by asset_id
- ✅ RLS policies parse path to determine access
- ✅ No cross-asset access possible

### 4. Signed URLs
- ✅ Short expiry (60 seconds)
- ✅ Generated only after authorization check
- ✅ One-time use recommended

### 5. Role-Based Access
- ✅ Owners: Full CRUD on own documents
- ✅ Nominees: Read-only on shared documents
- ✅ Admins: Full access for moderation

## Troubleshooting

### Issue: "Bucket not found"

**Solution:**
```sql
-- Check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'documents';

-- If not, create it
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('documents', 'documents', false, 52428800);
```

### Issue: "RLS policy violation"

**Solution:**
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- Check if policies exist
SELECT COUNT(*) FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- Re-apply policies if needed
-- Run 003_storage_buckets.sql again
```

### Issue: "File upload fails"

**Checklist:**
1. ✅ Bucket exists and is private
2. ✅ RLS is enabled on storage.objects
3. ✅ Upload policy exists
4. ✅ User is authenticated (JWT token valid)
5. ✅ Asset belongs to authenticated user
6. ✅ File size under 50 MB
7. ✅ Backend uses service_role key (bypasses RLS)

### Issue: "Cannot download file"

**Checklist:**
1. ✅ File exists in storage
2. ✅ User has access (owner, nominee, or admin)
3. ✅ Signed URL not expired (60 seconds)
4. ✅ Download policy exists
5. ✅ Asset is linked to nominee (if nominee)

### Issue: "Admin cannot access files"

**Solution:**
```sql
-- Verify admin policy exists
SELECT * FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname = 'admins_download_all_documents';

-- Verify user has admin role
SELECT id, email, role FROM users WHERE id = 'USER_ID';
```

## Rollback Instructions

If you need to rollback the storage setup:

### Remove Policies Only
```bash
cd backend
psql $DATABASE_URL -f migrations/rollback_003.sql
```

### Remove Bucket (DESTRUCTIVE!)
```sql
-- WARNING: This deletes all files!
DELETE FROM storage.objects WHERE bucket_id = 'documents';
DELETE FROM storage.buckets WHERE id = 'documents';
```

## Environment Variables

Ensure these are set in `backend/.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

**Important:** Use `service_role` key in backend, not `anon` key!

## Next Steps

After completing storage setup:

1. ✅ Task 42 Complete - Storage bucket and policies configured
2. → Task 43 - Connect backend to Supabase and test all endpoints
3. → Task 44 - Connect frontend to backend API
4. → Task 45 - Fix CORS and environment configuration

## Files Reference

```
backend/migrations/
├── 003_storage_buckets.sql ........... Storage bucket and RLS policies
├── rollback_003.sql .................. Rollback script
├── STORAGE_SETUP_GUIDE.md ............ This file
├── verify_storage_policies.sql ....... Verification queries
└── test_storage_access.md ............ Testing scenarios
```

## Requirements Coverage

### Requirement 3.1 ✅
"WHEN an Asset Owner uploads a document, THE LifeVault System SHALL accept files up to 50 MB in size"

**Implementation:**
- Bucket file_size_limit set to 52428800 bytes (50 MB)
- Backend validates file size before upload
- Storage rejects files exceeding limit

### Requirement 3.2 ✅
"WHEN an Asset Owner uploads a document, THE LifeVault System SHALL store the file in Supabase Storage with encryption"

**Implementation:**
- Files stored in private 'documents' bucket
- Supabase provides encryption at rest
- RLS policies enforce access control

### Requirement 3.5 ✅
"WHEN an Asset Owner requests to download a document, THE LifeVault System SHALL generate a secure signed URL valid for 60 seconds"

**Implementation:**
- Backend generates signed URLs via Supabase Storage API
- URLs expire after 60 seconds
- Access verified before URL generation

---

**Setup Status:** Ready for implementation  
**Migration Version:** 003  
**Total Storage Policies:** 7  
**Bucket Name:** documents  
**File Size Limit:** 50 MB
