# Quick Start Guide - Database Migration

Follow these 5 simple steps to set up your LifeVault database.

## Step 1: Test Connection ✅

```bash
cd backend
node migrations/test_connection.js
```

**Expected output:**
```
✅ Environment variables found
✅ Connection successful!
✅ Service role key is valid
```

**If it fails:** Check your `.env` file has correct `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`

---

## Step 2: Open Supabase Dashboard 🌐

1. Go to: https://app.supabase.com
2. Log in to your account
3. Select your LifeVault project
4. Click **SQL Editor** in the left sidebar

---

## Step 3: Run Migration Script 🚀

1. Click **New Query** button
2. Open `backend/migrations/001_initial_schema.sql` in your code editor
3. Copy all contents (Ctrl/Cmd + A, then Ctrl/Cmd + C)
4. Paste into Supabase SQL Editor (Ctrl/Cmd + V)
5. Click **Run** button (or press Ctrl/Cmd + Enter)

**Expected result:** "Success. No rows returned"

---

## Step 4: Verify Tables Created ✓

1. Click **Table Editor** in the left sidebar
2. You should see 5 new tables:
   - ✅ users
   - ✅ assets
   - ✅ documents
   - ✅ nominees
   - ✅ linked_nominees

---

## Step 5: Run Verification Script 🔍

1. Go back to **SQL Editor**
2. Click **New Query**
3. Open `backend/migrations/verify_schema.sql`
4. Copy and paste contents
5. Click **Run**

**Expected results:**
```
✅ PASS - All 5 tables exist
✅ PASS - All required indexes exist
✅ PASS - Foreign key constraints exist
```

---

## ✨ Done!

Your database is now ready. Next steps:

- **Task 41:** Set up Row Level Security (RLS) policies
- **Task 42:** Create Supabase Storage buckets
- **Task 43:** Connect backend and test endpoints

---

## 🆘 Troubleshooting

### "Connection failed"
- Check `.env` file has correct Supabase credentials
- Verify your Supabase project is active
- Check internet connection

### "Relation already exists"
- Tables already exist from previous migration
- Either skip migration or run `rollback_001.sql` first

### "Permission denied"
- Make sure you're using the **service_role** key (not anon key)
- Check key is correctly copied from Supabase dashboard

---

## 📚 More Information

- **Detailed guide:** `EXECUTION_GUIDE.md`
- **Complete checklist:** `MIGRATION_CHECKLIST.md`
- **Technical details:** `SUMMARY.md`
- **Rollback procedure:** `rollback_001.sql`

---

**Need help?** Review the documentation files or check the LifeVault design document.
