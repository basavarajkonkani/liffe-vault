# Supabase Setup Guide for LifeVault

This guide walks you through setting up your Supabase project for the LifeVault application.

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in the project details:
   - **Project Name**: `lifevault` (or your preferred name)
   - **Database Password**: Create a strong password (save this securely!)
   - **Region**: Choose the region closest to your users
   - **Pricing Plan**: Free tier is sufficient for development
5. Click "Create new project"
6. Wait for the project to be provisioned (takes 1-2 minutes)

## Step 2: Enable Email Authentication

1. In your Supabase dashboard, navigate to **Authentication** → **Providers**
2. Find **Email** in the list of providers
3. Ensure **Email** is enabled (it should be enabled by default)
4. Configure the following settings:
   - **Enable Email provider**: ✓ (checked)
   - **Confirm email**: ✓ (checked) - This enables OTP verification
   - **Secure email change**: ✓ (checked)

## Step 3: Configure Email Templates for OTP

1. Navigate to **Authentication** → **Email Templates**
2. Select **Magic Link** template (this is used for OTP)
3. Customize the email template if desired (optional)
4. The default template works well for OTP verification

## Step 4: Set OTP Expiry to 10 Minutes

1. Navigate to **Authentication** → **Settings**
2. Scroll down to **Auth Settings**
3. Find **Magic Link Expiry** or **OTP Expiry**
4. Set the value to **600** seconds (10 minutes)
5. Click **Save**

**Note**: If you don't see this setting in the UI, you can configure it via the Supabase API or it may use the default value. The default is typically 3600 seconds (1 hour), but you can control this in your backend code by checking the timestamp.

## Step 5: Get Your Supabase Credentials

### For Backend (.env)

1. In your Supabase dashboard, click on **Settings** (gear icon in sidebar)
2. Navigate to **API** section
3. Copy the following values:
   - **Project URL**: This is your `SUPABASE_URL`
   - **service_role key** (under "Project API keys"): This is your `SUPABASE_SERVICE_KEY`
     - ⚠️ **IMPORTANT**: The service_role key bypasses Row Level Security. Keep it secret!

### For Frontend (.env)

1. In the same **Settings** → **API** section
2. Copy the following values:
   - **Project URL**: This is your `VITE_SUPABASE_URL`
   - **anon public key** (under "Project API keys"): This is your `VITE_SUPABASE_ANON_KEY`
     - ✓ This key is safe to use in the browser

## Step 6: Update Environment Files

### Backend Configuration

Edit `backend/.env` and update these values:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Frontend Configuration

Create `frontend/.env` and add these values:

```env
VITE_API_URL=http://localhost:3000/api
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 7: Verify Configuration

1. Restart your backend server if it's running
2. Restart your frontend dev server if it's running
3. Test the authentication flow:
   - Try sending an OTP to your email
   - Verify you receive the email
   - Check that the OTP works

## Security Checklist

- [ ] Service role key is only in backend .env (never in frontend)
- [ ] .env files are in .gitignore
- [ ] Database password is stored securely
- [ ] Email authentication is enabled
- [ ] OTP expiry is configured
- [ ] Project URL and keys are copied correctly

## Troubleshooting

### Not Receiving OTP Emails?

1. Check your spam folder
2. Verify email provider is enabled in Authentication → Providers
3. Check Authentication → Logs for any errors
4. For development, you can view the OTP in the Supabase logs

### Invalid Credentials Error?

1. Double-check you copied the correct keys
2. Ensure no extra spaces in the .env file
3. Restart your servers after updating .env
4. Verify the SUPABASE_URL format (should start with https://)

### RLS Policies Not Working?

1. Ensure you're using the service_role key in the backend
2. The service_role key bypasses RLS (this is intentional for backend)
3. RLS policies will be set up in task 41

## Next Steps

After completing this setup:

1. ✓ Mark task 39 as complete
2. → Proceed to task 40: Run database migrations to create tables
3. → Then task 41: Implement Row Level Security policies
4. → Then task 42: Create Supabase Storage buckets

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Email Auth Guide](https://supabase.com/docs/guides/auth/auth-email)
- [Environment Variables Best Practices](https://supabase.com/docs/guides/getting-started/tutorials/with-react#project-setup)
