# RLS Policies Summary

Quick reference for all Row Level Security policies in LifeVault.

## Overview

- **Total Policies**: 27
- **Tables Protected**: 5
- **User Roles**: Owner, Nominee, Admin

## Policy Breakdown by Table

### 1. Users Table (5 policies)

| Policy Name | Operation | Who | What |
|------------|-----------|-----|------|
| `users_select_own` | SELECT | All Users | View own profile |
| `users_update_own` | UPDATE | All Users | Update own profile |
| `users_select_admin` | SELECT | Admins | View all users |
| `users_update_admin` | UPDATE | Admins | Update any user |
| `users_insert_own` | INSERT | All Users | Create own profile |

**Summary**: Users manage their own profiles; Admins see and manage all users.

### 2. Assets Table (6 policies)

| Policy Name | Operation | Who | What |
|------------|-----------|-----|------|
| `assets_select_owner` | SELECT | Owners | View own assets |
| `assets_select_nominee` | SELECT | Nominees | View shared assets |
| `assets_select_admin` | SELECT | Admins | View all assets |
| `assets_insert_owner` | INSERT | Owners | Create own assets |
| `assets_update_owner` | UPDATE | Owners | Update own assets |
| `assets_delete_owner` | DELETE | Owners | Delete own assets |

**Summary**: Owners have full CRUD on their assets; Nominees have read-only on shared assets; Admins have read-only on all assets.

### 3. Documents Table (4 policies)

| Policy Name | Operation | Who | What |
|------------|-----------|-----|------|
| `documents_select_accessible` | SELECT | All | View accessible documents |
| `documents_insert_owner` | INSERT | Owners | Upload to own assets |
| `documents_update_owner` | UPDATE | Owners | Update own documents |
| `documents_delete_owner` | DELETE | Owners | Delete own documents |

**Summary**: Document access follows asset access; Only owners can upload/modify/delete.

### 4. Nominees Table (5 policies)

| Policy Name | Operation | Who | What |
|------------|-----------|-----|------|
| `nominees_select_own` | SELECT | All Users | View own nominee record |
| `nominees_select_owners` | SELECT | Owners | View all nominees (for linking) |
| `nominees_select_admin` | SELECT | Admins | View all nominees |
| `nominees_insert_own` | INSERT | All Users | Create own nominee record |
| `nominees_insert_admin` | INSERT | Admins | Create nominee records |

**Summary**: Users manage their nominee status; Owners can see all nominees for linking; Admins have full visibility.

### 5. Linked Nominees Table (7 policies)

| Policy Name | Operation | Who | What |
|------------|-----------|-----|------|
| `linked_nominees_select_owner` | SELECT | Owners | View links for own assets |
| `linked_nominees_select_nominee` | SELECT | Nominees | View own links |
| `linked_nominees_select_admin` | SELECT | Admins | View all links |
| `linked_nominees_insert_owner` | INSERT | Owners | Link nominees to own assets |
| `linked_nominees_delete_owner` | DELETE | Owners | Unlink from own assets |
| `linked_nominees_insert_admin` | INSERT | Admins | Create any link |
| `linked_nominees_delete_admin` | DELETE | Admins | Delete any link |

**Summary**: Owners control nominee links for their assets; Nominees see their links; Admins manage all links.

## Access Matrix

### Owner Role

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| users | Own | Own | Own | ❌ |
| assets | Own | ✓ | Own | Own |
| documents | Own | Own | Own | Own |
| nominees | All | Own | ❌ | ❌ |
| linked_nominees | Own | Own | ❌ | Own |

### Nominee Role

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| users | Own | Own | Own | ❌ |
| assets | Shared | ❌ | ❌ | ❌ |
| documents | Shared | ❌ | ❌ | ❌ |
| nominees | Own | Own | ❌ | ❌ |
| linked_nominees | Own | ❌ | ❌ | ❌ |

### Admin Role

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| users | All | ❌ | All | ❌ |
| assets | All | ❌ | ❌ | ❌ |
| documents | All | ❌ | ❌ | ❌ |
| nominees | All | ✓ | ❌ | ❌ |
| linked_nominees | All | ✓ | ❌ | ✓ |

**Legend**: 
- ✓ = Can perform on any record
- Own = Can perform on own records only
- Shared = Can perform on shared records only
- All = Can view all records
- ❌ = Cannot perform

## Key Security Features

### 1. Data Isolation
- Owners can only see their own assets
- Nominees can only see explicitly shared assets
- No cross-owner data leakage

### 2. Read-Only Sharing
- Nominees have read-only access to shared assets
- Cannot modify, delete, or upload to shared assets
- Ensures data integrity

### 3. Admin Oversight
- Admins can view all data for support
- Admins cannot modify user assets (by design)
- Maintains user data ownership

### 4. Cascading Access
- Document access follows asset access
- If asset is shared, documents are accessible
- If asset is unshared, documents become inaccessible

### 5. Self-Service Linking
- Owners control who sees their assets
- Can link/unlink nominees at any time
- Changes take effect immediately

## Common Scenarios

### Scenario 1: Owner Creates Asset
```
1. Owner creates asset → assets_insert_owner allows
2. Owner uploads document → documents_insert_owner allows
3. Owner views asset → assets_select_owner allows
4. Other owners try to view → Blocked (no matching policy)
```

### Scenario 2: Sharing with Nominee
```
1. Owner links nominee → linked_nominees_insert_owner allows
2. Nominee views asset → assets_select_nominee allows (via join)
3. Nominee views documents → documents_select_accessible allows
4. Nominee tries to upload → Blocked (no matching policy)
```

### Scenario 3: Admin Access
```
1. Admin views all users → users_select_admin allows
2. Admin views all assets → assets_select_admin allows
3. Admin views all documents → documents_select_accessible allows
4. Admin tries to delete asset → Blocked (no matching policy)
```

### Scenario 4: Unsharing
```
1. Owner unlinks nominee → linked_nominees_delete_owner allows
2. Nominee tries to view asset → Blocked (no longer in linked_nominees)
3. Nominee tries to view documents → Blocked (asset not accessible)
```

## Testing Checklist

- [ ] Owner can create and view own assets
- [ ] Owner cannot view other owners' assets
- [ ] Nominee can view shared assets
- [ ] Nominee cannot view unshared assets
- [ ] Nominee cannot modify shared assets
- [ ] Admin can view all assets
- [ ] Admin cannot modify user assets
- [ ] Document access follows asset access
- [ ] Unlinking removes access immediately
- [ ] Users can view own profile
- [ ] Users cannot view other profiles (except admins)

## Troubleshooting

### "permission denied for table X"
- **Cause**: No policy allows the operation
- **Fix**: Verify user is authenticated and has correct role

### "row-level security policy for table X"
- **Cause**: RLS is enabled but policy doesn't match
- **Fix**: Check policy conditions match user's situation

### Users see data they shouldn't
- **Cause**: Policy is too permissive
- **Fix**: Review policy WHERE/WITH CHECK clauses

### Policies not enforced
- **Cause**: Using service role key (bypasses RLS)
- **Fix**: Use anon key for testing

## Quick Commands

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- List all policies
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public';

-- Count policies per table
SELECT tablename, COUNT(*) 
FROM pg_policies 
WHERE schemaname = 'public' 
GROUP BY tablename;

-- Test as specific user (in Supabase client)
-- Set JWT token for user, then query tables
```

## Related Files

- `002_rls_policies.sql` - Full policy definitions
- `verify_rls_policies.sql` - Verification queries
- `test_rls_policies.sql` - Testing scenarios
- `RLS_SETUP_GUIDE.md` - Setup instructions
- `rollback_002.sql` - Rollback script

---

**Last Updated**: 2025-11-24  
**Migration Version**: 002  
**Total Policies**: 27
