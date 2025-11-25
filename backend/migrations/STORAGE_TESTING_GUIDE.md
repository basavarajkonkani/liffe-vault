# Storage Testing Guide

## Overview

This guide provides comprehensive testing scenarios for Supabase Storage bucket and RLS policies in LifeVault.

## Prerequisites

- ✅ Storage bucket 'documents' created
- ✅ Storage RLS policies applied (migration 003)
- ✅ Backend server running
- ✅ Test users created (owner, nominee, admin)

## Test Environment Setup

### 1. Create Test Users

```bash
# Create test owner
curl -X POST http://localhost:3000/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "owner@test.com"}'

# Verify OTP and set PIN (repeat for nominee and admin)
# Save JWT tokens for each user
```

### 2. Create Test Asset

```bash
# As owner
curl -X POST http://localhost:3000/assets \
  -H "Authorization: Bearer OWNER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Asset for Storage",
    "category": "Personal"
  }'

# Save the asset ID
```

### 3. Prepare Test Files

```bash
# Create test files of various sizes
echo "Small test file" > test_small.txt
dd if=/dev/zero of=test_10mb.bin bs=1M count=10
dd if=/dev/zero of=test_50mb.bin bs=1M count=50
dd if=/dev/zero of=test_51mb.bin bs=1M count=51  # Should fail
```

## Test Scenarios

### Test 1: Owner Upload Document ✅

**Objective:** Verify asset owner can upload documents to their assets

**Steps:**
```bash
# Upload document as owner
curl -X POST http://localhost:3000/assets/ASSET_ID/documents \
  -H "Authorization: Bearer OWNER_JWT_TOKEN" \
  -F "file=@test_small.txt"
```

**Expected Result:**
- ✅ Status: 200 OK
- ✅ Response contains document ID and metadata
- ✅ File appears in Supabase Storage under `documents/ASSET_ID/`
- ✅ Document record created in database

**Verification:**
```sql
-- Check document in database
SELECT * FROM documents WHERE asset_id = 'ASSET_ID';

-- Check file in storage (Supabase Dashboard)
-- Navigate to Storage → documents → ASSET_ID
```

### Test 2: Owner Download Own Document ✅

**Objective:** Verify asset owner can download their own documents

**Steps:**
```bash
# Get download URL
curl -X GET http://localhost:3000/documents/DOCUMENT_ID/download \
  -H "Authorization: Bearer OWNER_JWT_TOKEN"

# Download file using signed URL
curl -o downloaded_file.txt "SIGNED_URL"
```

**Expected Result:**
- ✅ Status: 200 OK
- ✅ Signed URL returned (valid for 60 seconds)
- ✅ File downloads successfully
- ✅ File content matches original

**Verification:**
```bash
# Compare files
diff test_small.txt downloaded_file.txt
# Should show no differences
```

### Test 3: Nominee Access to Shared Document ✅

**Objective:** Verify nominee can access documents from shared assets

**Setup:**
```bash
# Link nominee to asset (as owner)
curl -X POST http://localhost:3000/nominees/link \
  -H "Authorization: Bearer OWNER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assetId": "ASSET_ID",
    "nomineeId": "NOMINEE_ID"
  }'
```

**Steps:**
```bash
# Download document as nominee
curl -X GET http://localhost:3000/documents/DOCUMENT_ID/download \
  -H "Authorization: Bearer NOMINEE_JWT_TOKEN"
```

**Expected Result:**
- ✅ Status: 200 OK
- ✅ Signed URL returned
- ✅ Nominee can download file
- ✅ File content accessible

### Test 4: Nominee Cannot Access Unshared Document ❌

**Objective:** Verify nominee cannot access documents from unshared assets

**Setup:**
```bash
# Create another asset (not shared with nominee)
curl -X POST http://localhost:3000/assets \
  -H "Authorization: Bearer OWNER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Private Asset",
    "category": "Personal"
  }'

# Upload document to private asset
curl -X POST http://localhost:3000/assets/PRIVATE_ASSET_ID/documents \
  -H "Authorization: Bearer OWNER_JWT_TOKEN" \
  -F "file=@test_small.txt"
```

**Steps:**
```bash
# Try to download private document as nominee
curl -X GET http://localhost:3000/documents/PRIVATE_DOCUMENT_ID/download \
  -H "Authorization: Bearer NOMINEE_JWT_TOKEN"
```

**Expected Result:**
- ❌ Status: 403 Forbidden or 404 Not Found
- ❌ No signed URL returned
- ❌ Access denied message

### Test 5: Nominee Cannot Upload Documents ❌

**Objective:** Verify nominee cannot upload documents to shared assets

**Steps:**
```bash
# Try to upload document as nominee
curl -X POST http://localhost:3000/assets/SHARED_ASSET_ID/documents \
  -H "Authorization: Bearer NOMINEE_JWT_TOKEN" \
  -F "file=@test_small.txt"
```

**Expected Result:**
- ❌ Status: 403 Forbidden
- ❌ Upload rejected
- ❌ Error message: "Only asset owners can upload documents"

### Test 6: Admin Access to All Documents ✅

**Objective:** Verify admin can access any document in the system

**Steps:**
```bash
# Download any document as admin
curl -X GET http://localhost:3000/documents/ANY_DOCUMENT_ID/download \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Expected Result:**
- ✅ Status: 200 OK
- ✅ Signed URL returned
- ✅ Admin can download any file
- ✅ Access granted regardless of ownership

### Test 7: File Size Limit (50 MB) ✅

**Objective:** Verify file size limit is enforced

**Steps:**
```bash
# Upload file under 50 MB (should succeed)
curl -X POST http://localhost:3000/assets/ASSET_ID/documents \
  -H "Authorization: Bearer OWNER_JWT_TOKEN" \
  -F "file=@test_10mb.bin"

# Upload file exactly 50 MB (should succeed)
curl -X POST http://localhost:3000/assets/ASSET_ID/documents \
  -H "Authorization: Bearer OWNER_JWT_TOKEN" \
  -F "file=@test_50mb.bin"

# Upload file over 50 MB (should fail)
curl -X POST http://localhost:3000/assets/ASSET_ID/documents \
  -H "Authorization: Bearer OWNER_JWT_TOKEN" \
  -F "file=@test_51mb.bin"
```

**Expected Result:**
- ✅ 10 MB file: Success
- ✅ 50 MB file: Success
- ❌ 51 MB file: Rejected with error "File size exceeds 50 MB limit"

### Test 8: Owner Delete Own Document ✅

**Objective:** Verify owner can delete their own documents

**Steps:**
```bash
# Delete document as owner
curl -X DELETE http://localhost:3000/documents/DOCUMENT_ID \
  -H "Authorization: Bearer OWNER_JWT_TOKEN"
```

**Expected Result:**
- ✅ Status: 200 OK
- ✅ Document deleted from database
- ✅ File removed from storage
- ✅ Success message returned

**Verification:**
```sql
-- Check document is deleted
SELECT * FROM documents WHERE id = 'DOCUMENT_ID';
-- Should return no rows

-- Check file is deleted (Supabase Dashboard)
-- File should not appear in storage
```

### Test 9: Nominee Cannot Delete Shared Document ❌

**Objective:** Verify nominee cannot delete documents from shared assets

**Steps:**
```bash
# Try to delete shared document as nominee
curl -X DELETE http://localhost:3000/documents/SHARED_DOCUMENT_ID \
  -H "Authorization: Bearer NOMINEE_JWT_TOKEN"
```

**Expected Result:**
- ❌ Status: 403 Forbidden
- ❌ Deletion rejected
- ❌ Error message: "Only asset owners can delete documents"
- ✅ Document remains in database and storage

### Test 10: Access Revocation on Unlink ✅

**Objective:** Verify nominee loses access when unlinked from asset

**Setup:**
```bash
# Verify nominee has access
curl -X GET http://localhost:3000/documents/DOCUMENT_ID/download \
  -H "Authorization: Bearer NOMINEE_JWT_TOKEN"
# Should succeed
```

**Steps:**
```bash
# Unlink nominee from asset (as owner)
curl -X DELETE http://localhost:3000/nominees/link/LINK_ID \
  -H "Authorization: Bearer OWNER_JWT_TOKEN"

# Try to access document again (as nominee)
curl -X GET http://localhost:3000/documents/DOCUMENT_ID/download \
  -H "Authorization: Bearer NOMINEE_JWT_TOKEN"
```

**Expected Result:**
- ✅ Unlink succeeds
- ❌ Nominee access denied after unlink
- ❌ Status: 403 Forbidden
- ✅ Access revoked immediately

### Test 11: Signed URL Expiry ✅

**Objective:** Verify signed URLs expire after 60 seconds

**Steps:**
```bash
# Get signed URL
SIGNED_URL=$(curl -s -X GET http://localhost:3000/documents/DOCUMENT_ID/download \
  -H "Authorization: Bearer OWNER_JWT_TOKEN" | jq -r '.data.url')

# Download immediately (should succeed)
curl -o file1.txt "$SIGNED_URL"

# Wait 61 seconds
sleep 61

# Try to download again (should fail)
curl -o file2.txt "$SIGNED_URL"
```

**Expected Result:**
- ✅ First download: Success
- ❌ Second download: Fails with "URL expired" error
- ✅ URL expires after 60 seconds

### Test 12: Multiple File Types ✅

**Objective:** Verify various file types can be uploaded

**Steps:**
```bash
# Upload PDF
curl -X POST http://localhost:3000/assets/ASSET_ID/documents \
  -H "Authorization: Bearer OWNER_JWT_TOKEN" \
  -F "file=@test.pdf"

# Upload image
curl -X POST http://localhost:3000/assets/ASSET_ID/documents \
  -H "Authorization: Bearer OWNER_JWT_TOKEN" \
  -F "file=@test.jpg"

# Upload Word document
curl -X POST http://localhost:3000/assets/ASSET_ID/documents \
  -H "Authorization: Bearer OWNER_JWT_TOKEN" \
  -F "file=@test.docx"

# Upload text file
curl -X POST http://localhost:3000/assets/ASSET_ID/documents \
  -H "Authorization: Bearer OWNER_JWT_TOKEN" \
  -F "file=@test.txt"
```

**Expected Result:**
- ✅ All file types upload successfully
- ✅ MIME types preserved
- ✅ Files downloadable with correct content type

### Test 13: Concurrent Uploads ✅

**Objective:** Verify multiple simultaneous uploads work correctly

**Steps:**
```bash
# Upload multiple files concurrently
for i in {1..5}; do
  curl -X POST http://localhost:3000/assets/ASSET_ID/documents \
    -H "Authorization: Bearer OWNER_JWT_TOKEN" \
    -F "file=@test_file_$i.txt" &
done
wait
```

**Expected Result:**
- ✅ All uploads succeed
- ✅ No file conflicts
- ✅ All files stored correctly
- ✅ Unique filenames generated

### Test 14: Path Traversal Prevention ❌

**Objective:** Verify path traversal attacks are prevented

**Steps:**
```bash
# Try to upload with malicious filename
curl -X POST http://localhost:3000/assets/ASSET_ID/documents \
  -H "Authorization: Bearer OWNER_JWT_TOKEN" \
  -F "file=@test.txt;filename=../../../etc/passwd"
```

**Expected Result:**
- ❌ Upload rejected or filename sanitized
- ✅ File stored in correct asset folder
- ✅ No path traversal possible

### Test 15: Unauthenticated Access ❌

**Objective:** Verify unauthenticated users cannot access storage

**Steps:**
```bash
# Try to upload without token
curl -X POST http://localhost:3000/assets/ASSET_ID/documents \
  -F "file=@test.txt"

# Try to download without token
curl -X GET http://localhost:3000/documents/DOCUMENT_ID/download
```

**Expected Result:**
- ❌ Status: 401 Unauthorized
- ❌ Access denied
- ❌ Error message: "Authentication required"

## Automated Test Script

Create a test script to run all scenarios:

```bash
#!/bin/bash
# storage_test.sh

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Test function
test_case() {
  local name=$1
  local command=$2
  local expected_status=$3
  
  echo "Testing: $name"
  response=$(eval $command)
  status=$?
  
  if [ $status -eq $expected_status ]; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((PASSED++))
  else
    echo -e "${RED}✗ FAIL${NC}"
    ((FAILED++))
  fi
  echo ""
}

# Run tests
echo "=== LifeVault Storage Tests ==="
echo ""

test_case "Owner upload" \
  "curl -s -X POST http://localhost:3000/assets/$ASSET_ID/documents -H 'Authorization: Bearer $OWNER_TOKEN' -F 'file=@test.txt'" \
  0

test_case "Owner download" \
  "curl -s -X GET http://localhost:3000/documents/$DOC_ID/download -H 'Authorization: Bearer $OWNER_TOKEN'" \
  0

test_case "Nominee access shared" \
  "curl -s -X GET http://localhost:3000/documents/$SHARED_DOC_ID/download -H 'Authorization: Bearer $NOMINEE_TOKEN'" \
  0

test_case "Nominee access unshared" \
  "curl -s -X GET http://localhost:3000/documents/$PRIVATE_DOC_ID/download -H 'Authorization: Bearer $NOMINEE_TOKEN'" \
  1

# Summary
echo "=== Test Summary ==="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
```

## Manual Testing Checklist

- [ ] Storage bucket 'documents' exists
- [ ] Bucket is private (not public)
- [ ] File size limit is 50 MB
- [ ] RLS enabled on storage.objects
- [ ] 7 storage policies created
- [ ] Owner can upload documents
- [ ] Owner can download own documents
- [ ] Owner can delete own documents
- [ ] Nominee can download shared documents
- [ ] Nominee cannot download unshared documents
- [ ] Nominee cannot upload documents
- [ ] Nominee cannot delete documents
- [ ] Admin can access all documents
- [ ] File size limit enforced
- [ ] Signed URLs expire after 60 seconds
- [ ] Access revoked on unlink
- [ ] Multiple file types supported
- [ ] Unauthenticated access denied

## Troubleshooting

### Issue: Upload fails with "RLS policy violation"

**Diagnosis:**
```sql
-- Check if upload policy exists
SELECT * FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname = 'owners_upload_to_own_assets';
```

**Solution:**
- Re-apply storage migration 003
- Verify asset belongs to authenticated user
- Check JWT token is valid

### Issue: Download returns 403 Forbidden

**Diagnosis:**
```sql
-- Check if user has access to asset
SELECT a.id, a.owner_id, ln.nominee_id
FROM assets a
LEFT JOIN linked_nominees ln ON ln.asset_id = a.id
WHERE a.id = 'ASSET_ID';
```

**Solution:**
- Verify user is owner or linked nominee
- Check download policy exists
- Verify JWT token contains correct user ID

### Issue: Signed URL expired

**Solution:**
- Generate new signed URL
- Download within 60 seconds
- Consider increasing expiry time in backend

## Performance Testing

### Load Test: Concurrent Uploads

```bash
# Install Apache Bench
# brew install httpd (macOS)

# Test 100 concurrent uploads
ab -n 100 -c 10 -H "Authorization: Bearer $TOKEN" \
  -p upload_data.txt \
  http://localhost:3000/assets/$ASSET_ID/documents
```

### Load Test: Concurrent Downloads

```bash
# Test 100 concurrent downloads
ab -n 100 -c 10 -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/documents/$DOC_ID/download
```

## Security Testing

### Test: SQL Injection in Filename

```bash
curl -X POST http://localhost:3000/assets/ASSET_ID/documents \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.txt;filename='; DROP TABLE documents; --"
```

**Expected:** Filename sanitized, no SQL injection

### Test: XSS in Filename

```bash
curl -X POST http://localhost:3000/assets/ASSET_ID/documents \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.txt;filename=<script>alert('xss')</script>.txt"
```

**Expected:** Filename sanitized, no XSS possible

## Requirements Verification

### Requirement 3.1 ✅
"WHEN an Asset Owner uploads a document, THE LifeVault System SHALL accept files up to 50 MB in size"

**Tests:** Test 7 (File Size Limit)

### Requirement 3.2 ✅
"WHEN an Asset Owner uploads a document, THE LifeVault System SHALL store the file in Supabase Storage with encryption"

**Tests:** Test 1 (Owner Upload), Test 12 (Multiple File Types)

### Requirement 3.5 ✅
"WHEN an Asset Owner requests to download a document, THE LifeVault System SHALL generate a secure signed URL valid for 60 seconds"

**Tests:** Test 2 (Owner Download), Test 11 (Signed URL Expiry)

---

**Testing Status:** Ready for execution  
**Total Test Scenarios:** 15  
**Coverage:** Upload, Download, Access Control, Security
