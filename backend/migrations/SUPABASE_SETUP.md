# Supabase Project Setup Guide

Complete guide to creating a new Supabase project for LifeVault.

## Step 1: Create Supabase Account

1. Go to https://supabase.com
2. Click **Start your project** or **Sign In**
3. Sign up with:
   - GitHub account (recommended)
   - Email/password
   - Or other OAuth providers

## Step 2: Create New Project

1. After logging in, click **New Project**
2. Select your organization (or create one)
3. Fill in project details:
   - **Name:** `lifevault` (or your preferred name)
   - **Database Password:** Generate a strong password (save this!)
   - **Region:** Choose closest to your users
   - **Pricing Plan:** Free tier is fine for development

4. Click **Create new project**
5. Wait 2-3 minutes for project to be provisioned

## Step 3: Get Your Credentials

Once your project is ready:

### Get Project URL
1. Go to **Settings** (gear icon in sidebar)
2. Click **API**
3. Find **Project URL**
4. Copy it (looks like: `https://xxxxxxxxxxxxx.supabase.co`)

### Get Service Role Key
1. Still in **Settings → API**
2. Scroll to **Project API keys**
3. Find **service_role** key (NOT the anon key!)
4. Click **Reveal** and copy the key
5. ⚠️ **Important:** Keep this secret! Never commit to git!

## Step 4: Configure Backend

1. Open `backend/.env` file (create if it doesn't exist)
2. Add your Supabase credentials:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
```

3. Save the file
4. Verify `.env` is in your `.gitignore`

## Step 5: Test Connection

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

## Step 6: Run Database Migration

Now you're ready to run the migration! Follow one of these guides:

- **Quick:** `migrations/QUICK_START.md`
- **Detailed:** `migrations/EXECUTION_GUIDE.md`

**Summary:**
1. Open Supabase Dashboard → SQL Editor
2. Copy `migrations/001_initial_schema.sql`
3. Paste and run
4. Verify with `migrations/verify_schema.sql`

## Step 7: Enable Email Auth (Optional for Development)

For OTP authentication to work:

1. Go to **Authentication** in Supabase dashboard
2. Click **Providers**
3. Enable **Email** provider
4. Configure email settings:
   - **Enable Email Confirmations:** Off (for development)
   - **Enable Email OTP:** On
   - **Secure Email Change:** On (recommended)

For production, you'll want to configure a custom SMTP provider.

## Step 8: Create Storage Bucket (Task 42)

This will be done in a later task, but here's a preview:

1. Go to **Storage** in Supabase dashboard
2. Click **New bucket**
3. Name it `documents`
4. Set as **Private** (not public)
5. Configure policies (covered in Task 42)

## Verification Checklist

After setup, verify:

- [ ] Supabase project is created and active
- [ ] Project URL is copied to `.env`
- [ ] Service role key is copied to `.env`
- [ ] `.env` file is in `.gitignore`
- [ ] Connection test passes
- [ ] Ready to run migrations

## Troubleshooting

### "Cannot find module 'dotenv'"
```bash
cd backend
npm install
```

### "Connection failed"
- Double-check SUPABASE_URL format (should include https://)
- Verify you copied the service_role key (not anon key)
- Check for extra spaces in .env file
- Ensure project is fully provisioned (wait a few minutes)

### "Permission denied"
- Make sure you're using service_role key
- Check that key is correctly copied (no truncation)

### Email not in .gitignore
Add to `.gitignore`:
```
.env
.env.local
```

## Security Best Practices

✅ **DO:**
- Use service_role key only in backend (never in frontend)
- Keep .env file out of version control
- Use different projects for dev/staging/production
- Rotate keys if they're ever exposed
- Use environment variables in production

❌ **DON'T:**
- Commit .env file to git
- Share service_role key publicly
- Use service_role key in frontend code
- Use production database for development

## Project Structure After Setup

```
Supabase Project
├── Authentication
│   └── Email provider (enabled)
├── Database
│   ├── Tables (after migration)
│   │   ├── users
│   │   ├── assets
│   │   ├── documents
│   │   ├── nominees
│   │   └── linked_nominees
│   └── Policies (Task 41)
└── Storage
    └── documents bucket (Task 42)
```

## Cost Considerations

**Free Tier Includes:**
- 500 MB database space
- 1 GB file storage
- 2 GB bandwidth
- 50,000 monthly active users
- Unlimited API requests

This is more than enough for development and small production apps.

## Next Steps

After Supabase setup is complete:

1. ✅ **Task 40:** Run database migrations (you're here!)
2. ⏭️ **Task 41:** Implement Row Level Security policies
3. ⏭️ **Task 42:** Create Storage buckets and policies
4. ⏭️ **Task 43:** Connect backend and test endpoints

## Useful Links

- **Supabase Dashboard:** https://app.supabase.com
- **Supabase Docs:** https://supabase.com/docs
- **API Reference:** https://supabase.com/docs/reference/javascript
- **SQL Editor:** Dashboard → SQL Editor
- **Table Editor:** Dashboard → Table Editor
- **Storage:** Dashboard → Storage

## Support

If you need help:
- Supabase Discord: https://discord.supabase.com
- Supabase GitHub: https://github.com/supabase/supabase
- Documentation: https://supabase.com/docs

---

**Ready to proceed?** Once your Supabase project is set up and credentials are in `.env`, run the migration following `QUICK_START.md`!
