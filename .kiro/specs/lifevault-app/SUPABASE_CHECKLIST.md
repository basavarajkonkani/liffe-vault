# Supabase Setup Checklist

Use this checklist to track your progress setting up Supabase for LifeVault.

## Task 39: Create Supabase Project and Configure Authentication

### Step 1: Create Project
- [ ] Go to https://supabase.com and sign in
- [ ] Click "New Project"
- [ ] Enter project name: `lifevault`
- [ ] Set database password (save it securely!)
- [ ] Select region
- [ ] Click "Create new project"
- [ ] Wait for provisioning to complete

### Step 2: Enable Email Authentication
- [ ] Navigate to Authentication → Providers
- [ ] Verify Email provider is enabled
- [ ] Confirm email verification is enabled

### Step 3: Configure Email Templates
- [ ] Navigate to Authentication → Email Templates
- [ ] Review Magic Link template (used for OTP)
- [ ] Customize if desired (optional)

### Step 4: Set OTP Expiry
- [ ] Navigate to Authentication → Settings
- [ ] Find OTP/Magic Link expiry setting
- [ ] Set to 600 seconds (10 minutes)
- [ ] Click Save

### Step 5: Copy Credentials
- [ ] Navigate to Settings → API
- [ ] Copy Project URL
- [ ] Copy service_role key (for backend)
- [ ] Copy anon public key (for frontend)

### Step 6: Update Environment Files

#### Backend (.env)
- [ ] Open `backend/.env`
- [ ] Replace `SUPABASE_URL` with your Project URL
- [ ] Replace `SUPABASE_SERVICE_KEY` with your service_role key
- [ ] Save the file

#### Frontend (.env)
- [ ] Open `frontend/.env` (already created)
- [ ] Replace `VITE_SUPABASE_URL` with your Project URL
- [ ] Replace `VITE_SUPABASE_ANON_KEY` with your anon public key
- [ ] Save the file

### Step 7: Verify Setup
- [ ] Restart backend server (if running)
- [ ] Restart frontend dev server (if running)
- [ ] No errors in console related to Supabase connection

### Security Verification
- [ ] Service role key is ONLY in backend/.env
- [ ] Anon key is in frontend/.env
- [ ] Both .env files are in .gitignore
- [ ] No credentials committed to git

## Completion

Once all items are checked:
- [ ] Mark task 39 as complete in tasks.md
- [ ] Proceed to task 40: Run database migrations

---

**Need Help?** See the detailed guide: `SUPABASE_SETUP_GUIDE.md`
