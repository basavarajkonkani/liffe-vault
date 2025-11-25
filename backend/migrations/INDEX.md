# Migration Files Index

Quick reference to all migration files and their purposes.

## 🚀 Getting Started

| File | Purpose | When to Use |
|------|---------|-------------|
| **SUPABASE_SETUP.md** | Create Supabase project from scratch | Don't have Supabase yet? Start here! |
| **QUICK_START.md** | 5-step quick start guide | Already have Supabase? Start here! |
| **test_connection.js** | Test Supabase connection | Before running migration |

## 📋 Migration Files

| File | Purpose | When to Use |
|------|---------|-------------|
| **001_initial_schema.sql** | Initial schema migration | Run in Supabase SQL Editor |
| **verify_schema.sql** | Schema verification queries | After running 001 migration |
| **rollback_001.sql** | Schema rollback script | If you need to undo 001 migration |
| **002_rls_policies.sql** | Row Level Security policies | After 001 migration |
| **verify_rls_policies.sql** | RLS verification queries | After running 002 migration |
| **rollback_002.sql** | RLS rollback script | If you need to undo RLS policies |
| **test_rls_policies.sql** | RLS testing documentation | To understand RLS testing |
| **apply_rls_migration.js** | Node.js RLS migration script | Alternative to SQL Editor |
| **003_storage_buckets.sql** | Storage bucket and RLS policies | After 002 migration |
| **verify_storage_policies.sql** | Storage verification queries | After running 003 migration |
| **rollback_003.sql** | Storage rollback script | If you need to undo storage policies |
| **apply_storage_migration.js** | Node.js storage migration script | Alternative to SQL Editor |

## 📖 Documentation

| File | Purpose | When to Use |
|------|---------|-------------|
| **README.md** | Quick reference | Overview of migrations |
| **EXECUTION_GUIDE.md** | Detailed step-by-step guide | Need detailed instructions |
| **MIGRATION_CHECKLIST.md** | Complete verification checklist | Ensure nothing is missed |
| **SUMMARY.md** | Technical overview | Understand what migration does |
| **RLS_SETUP_GUIDE.md** | RLS setup and testing guide | Setting up Row Level Security |
| **STORAGE_SETUP_GUIDE.md** | Storage bucket setup guide | Setting up Supabase Storage |
| **STORAGE_TESTING_GUIDE.md** | Storage testing scenarios | Testing storage access control |
| **TASK_41_COMPLETION.md** | RLS implementation summary | Review RLS completion |
| **TASK_42_COMPLETION.md** | Storage implementation summary | Review storage completion |
| **INDEX.md** | This file | Find the right document |

## 🎯 Recommended Reading Order

### For First-Time Setup:
1. **QUICK_START.md** - Get up and running fast
2. **EXECUTION_GUIDE.md** - Detailed instructions
3. **verify_schema.sql** - Verify everything works

### For Understanding:
1. **SUMMARY.md** - What the migration does
2. **001_initial_schema.sql** - The actual SQL code
3. **MIGRATION_CHECKLIST.md** - Complete verification

### For Troubleshooting:
1. **test_connection.js** - Test connection
2. **EXECUTION_GUIDE.md** - Troubleshooting section
3. **rollback_001.sql** - Undo if needed

## 📊 Migration Contents

### Migration 001: Initial Schema

**Tables (5)**
- users
- assets
- documents
- nominees
- linked_nominees

**Indexes (5)**
- idx_assets_owner_id
- idx_documents_asset_id
- idx_nominees_user_id
- idx_linked_nominees_asset_id
- idx_linked_nominees_nominee_id

**Constraints**
- 6 Foreign Keys (all with CASCADE)
- 2 CHECK constraints (role, category)
- 3 UNIQUE constraints

**Triggers (2)**
- update_users_updated_at
- update_assets_updated_at

### Migration 002: Row Level Security

**RLS Enabled on (5 tables)**
- users
- assets
- documents
- nominees
- linked_nominees

**Policies (27 total)**
- users: 5 policies
- assets: 6 policies
- documents: 4 policies
- nominees: 5 policies
- linked_nominees: 7 policies

### Migration 003: Storage Buckets

**Storage Bucket**
- documents (private, 50 MB limit)

**RLS Enabled on**
- storage.objects

**Storage Policies (7 total)**
- Upload: 1 policy
- Download: 3 policies
- Delete: 2 policies
- Update: 1 policy

## 🔗 Quick Links

- **Supabase Dashboard:** https://app.supabase.com
- **Supabase Docs:** https://supabase.com/docs
- **LifeVault Design:** `../.kiro/specs/lifevault-app/design.md`
- **LifeVault Requirements:** `../.kiro/specs/lifevault-app/requirements.md`

## ✅ Checklist

### Phase 1: Initial Schema
- [ ] Read QUICK_START.md
- [ ] Run test_connection.js
- [ ] Execute 001_initial_schema.sql
- [ ] Verify with verify_schema.sql
- [ ] Complete MIGRATION_CHECKLIST.md

### Phase 2: Row Level Security
- [ ] Read RLS_SETUP_GUIDE.md
- [ ] Execute 002_rls_policies.sql
- [ ] Verify with verify_rls_policies.sql
- [ ] Test with test_rls_policies.sql scenarios
- [ ] Run backend tests: npm test

### Phase 3: Storage Buckets
- [ ] Read STORAGE_SETUP_GUIDE.md
- [ ] Create 'documents' bucket (Dashboard or script)
- [ ] Execute 003_storage_buckets.sql
- [ ] Verify with verify_storage_policies.sql
- [ ] Test with STORAGE_TESTING_GUIDE.md scenarios
- [ ] Test file upload via backend API

---

**Last Updated:** 2025-11-24  
**Migration Version:** 003  
**Status:** Storage bucket and policies ready for execution
