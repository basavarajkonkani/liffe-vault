# Row Level Security (RLS) Setup Guide

## Overview

This guide explains how to apply and test Row Level Security policies for the LifeVault application. RLS ensures that users can only access data they are authorized to see based on their role (Owner, Nominee, or Admin).

## What is Row Level Security?

Row Level Security (RLS) is a PostgreSQL feature that allows you to control which rows users can access in a table. In Supabase, RLS policies are enforced based on the authenticated user's JWT token (`auth.uid()`).

## Prerequisites

- Supabase project created
- Initial schema migration (001_initial_schema.sql) already applied
- Supabase CLI installed (optional, for command-line execution)

## Step 1: Apply RLS Policies

### Option A: Using Supabase Dashboard (Recommended)

1. Log in to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the contents of `002_rls_policies.sql`
5. Paste into the SQL editor
6. Click **Run** to execute the migration
7. Verify no errors appear in the output

### Option B: Using Supabase CLI

```bash
# Navigate to the migrations directory
cd backend/migrations

# Apply the migration
supabase db push

# Or execute the specific file
psql $DATABASE_URL -f 002_rls_policies.sql
```

### Option C: Using Node.js Script

```bash
# From the backend directory
node migrations/apply_rls_migration.js
```

## Step 2: Verify RLS Policies

After applying the policies, verify they were created correctly:

1. Open Supabase Dashboard → **SQL Editor**
2. Copy the contents of `verify_rls_policies.sql`
3. Run the verification queries
4. Check the output:
   - All 5 tables should have `rls_enabled = true`
   - Total of 27 policies should be created
   - All critical policies should show ✓ (checkmark)

### Expected Policy Counts

- **users**: 5 policies
- **assets**: 6 policies
- **documents**: 4 policies
- **nominees**: 5 policies
- **linked_nominees**: 7 policies

## Step 3: Test RLS Policies

### Automated Testing (Recommended)

Run the backend test suite which includes RLS policy tests:

```bash
cd backend
npm test
```

The test suite will:
- Create test users with different roles
- Verify each role can only access authorized data
- Test cross-role scenarios
- Verify document access controls

### Manual Testing

Follow the test scenarios in `test_rls_policies.sql`:

#### Test 1: Owner Access
1. Create an owner user through the app
2. Create an asset
3. Verify the owner can view, update, and delete their asset
4. Verify the owner cannot see other owners' assets

#### Test 2: Nominee Access
1. Create a nominee user
2. Have an owner link the nominee to an asset
3. Verify the nominee can view the shared asset
4. Verify the nominee cannot modify the asset
5. Verify the nominee cannot see unshared assets

#### Test 3: Admin Access
1. Create an admin user
2. Verify the admin can view all users
3. Verify the admin can view all assets
4. Verify the admin can view all documents

#### Test 4: Document Access
1. Owner uploads a document
2. Owner links a nominee
3. Verify both can download the document
4. Owner unlinks the nominee
5. Verify nominee can no longer access the document

## Step 4: Troubleshooting

### Issue: "permission denied for table"

**Cause**: RLS is enabled but no policy allows the operation.

**Solution**: 
- Verify the user is authenticated (`auth.uid()` returns a value)
- Check that the user's role is correctly set in the users table
- Verify the policy conditions match the user's situation

### Issue: Users can see data they shouldn't

**Cause**: RLS might not be enabled or policies are too permissive.

**Solution**:
- Run `verify_rls_policies.sql` to check RLS is enabled
- Review policy conditions in `002_rls_policies.sql`
- Check for conflicting policies

### Issue: Policies not working in development

**Cause**: Using service role key bypasses RLS.

**Solution**:
- Use the anon key in your Supabase client for testing
- Service role key should only be used in backend with proper authorization checks

## Step 5: Rollback (If Needed)

If you need to remove the RLS policies:

1. Open Supabase Dashboard → **SQL Editor**
2. Copy the contents of `rollback_002.sql`
3. Run the rollback script
4. This will drop all policies and disable RLS

**Warning**: Only rollback in development. Never disable RLS in production.

## Policy Summary

### Users Table
- ✓ Users can view their own profile
- ✓ Users can update their own profile
- ✓ Admins can view all users
- ✓ Admins can update all users

### Assets Table
- ✓ Owners can manage their own assets (CRUD)
- ✓ Nominees can view shared assets (read-only)
- ✓ Admins can view all assets (read-only)

### Documents Table
- ✓ Owners can manage documents in their assets (CRUD)
- ✓ Nominees can view documents in shared assets (read-only)
- ✓ Admins can view all documents (read-only)

### Nominees Table
- ✓ Users can view their own nominee record
- ✓ Owners can view all nominees (for linking)
- ✓ Admins can view all nominees

### Linked Nominees Table
- ✓ Owners can link/unlink nominees to their assets
- ✓ Nominees can view their own links
- ✓ Admins can manage all links

## Security Best Practices

1. **Always use RLS in production** - Never disable RLS on production databases
2. **Test with real users** - Create test accounts for each role and verify access
3. **Use anon key in frontend** - Never expose service role key to clients
4. **Audit regularly** - Review policies periodically to ensure they match requirements
5. **Monitor logs** - Check Supabase logs for unauthorized access attempts

## Next Steps

After RLS is configured:

1. ✓ Test the complete authentication flow
2. ✓ Test asset creation and sharing
3. ✓ Test document upload and download
4. ✓ Test admin functionality
5. → Move to Task 42: Create Supabase Storage buckets and policies

## Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [LifeVault Design Document](../../.kiro/specs/lifevault-app/design.md)
- [LifeVault Requirements](../../.kiro/specs/lifevault-app/requirements.md)
