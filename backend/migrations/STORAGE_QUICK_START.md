# Storage Quick Start Guide

## 🚀 5-Step Storage Setup

### Step 1: Create Storage Bucket (2 minutes)

**Via Supabase Dashboard:**
1. Open https://app.supabase.com
2. Select your project
3. Click **Storage** in sidebar
4. Click **New bucket**
5. Enter:
   - Name: `documents`
   - Public: ❌ **Unchecked**
   - File size limit: `52428800`
6. Click **Create bucket**

✅ **Verification:** Bucket appears in storage list

### Step 2: Apply Storage RLS Policies (1 minute)

1. Click **SQL Editor** in sidebar
2. Click **New query**
3. Copy contents of `003_storage_buckets.sql`
4. Paste into editor
5. Click **Run** (or Cmd/Ctrl + Enter)

✅ **Verification:** See "Success. No rows returned" message

### Step 3: Verify Setup (30 seconds)

1. In SQL Editor, click **New query**
2. Copy contents of `verify_storage_policies.sql`
3. Paste and click **Run**
4. Check all results show ✓ PASS

✅ **Expected:** All 10 checks pass

### Step 4: Test Upload (1 minute)

```bash
# Start backend server
cd backend
npm run dev

# In another terminal, upload a test file
curl -X POST http://localhost:3000/assets/ASSET_ID/documents \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@test.pdf"
```

✅ **Expected:** File uploads successfully

### Step 5: Verify in Dashboard (30 seconds)

1. Go to **Storage** → **documents** bucket
2. You should see folder with asset ID
3. Click folder to see uploaded file

✅ **Done!** Storage is ready

## 📋 Quick Checklist

- [ ] Bucket 'documents' created
- [ ] Bucket is private (not public)
- [ ] File size limit is 50 MB
- [ ] RLS policies applied (7 total)
- [ ] Verification queries pass
- [ ] Test upload succeeds
- [ ] File visible in dashboard

## 🔧 Troubleshooting

### Bucket creation fails
- Check you have project admin access
- Try refreshing the dashboard
- Use SQL method instead

### Policy application fails
- Ensure migration 001 and 002 are applied first
- Check for syntax errors in SQL
- Verify you're using the correct project

### Upload fails
- Check JWT token is valid
- Verify asset belongs to user
- Ensure file is under 50 MB
- Check backend .env has correct SUPABASE_SERVICE_KEY

## 📚 Next Steps

- ✅ Storage setup complete
- → Read `STORAGE_TESTING_GUIDE.md` for comprehensive tests
- → Proceed to Task 43: Test all backend endpoints
- → Proceed to Task 44: Connect frontend to backend

## 🆘 Need Help?

- **Detailed Setup:** `STORAGE_SETUP_GUIDE.md`
- **Testing Guide:** `STORAGE_TESTING_GUIDE.md`
- **Completion Summary:** `TASK_42_COMPLETION.md`
- **All Files:** `INDEX.md`

---

**Total Time:** ~5 minutes  
**Difficulty:** Easy  
**Status:** Ready to execute
