# Migration Workflow

Visual guide to the database migration process.

## Process Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    MIGRATION WORKFLOW                        │
└─────────────────────────────────────────────────────────────┘

1. PREPARATION
   ├─ Read QUICK_START.md or INDEX.md
   ├─ Ensure .env file is configured
   └─ Run: node migrations/test_connection.js
      │
      ├─ ✅ Success → Continue to Step 2
      └─ ❌ Failed → Fix .env and retry

2. EXECUTION
   ├─ Open Supabase Dashboard (https://app.supabase.com)
   ├─ Navigate to SQL Editor
   ├─ Copy 001_initial_schema.sql contents
   ├─ Paste into SQL Editor
   └─ Click Run
      │
      ├─ ✅ Success → Continue to Step 3
      └─ ❌ Failed → Check error, fix, retry

3. VERIFICATION
   ├─ Check Table Editor for 5 tables
   ├─ Run verify_schema.sql in SQL Editor
   └─ Review MIGRATION_CHECKLIST.md
      │
      ├─ ✅ All checks pass → Continue to Step 4
      └─ ❌ Some checks fail → Review and fix

4. COMPLETION
   ├─ Mark task 40 as complete ✅
   ├─ Update team/documentation
   └─ Proceed to Step 5 (RLS policies)

5. RLS POLICIES (Task 41)
   ├─ Read RLS_SETUP_GUIDE.md
   ├─ Copy 002_rls_policies.sql contents
   ├─ Paste into SQL Editor and Run
   └─ Run verify_rls_policies.sql
      │
      ├─ ✅ Success → Continue to Step 6
      └─ ❌ Failed → Check error, fix, retry

6. RLS VERIFICATION
   ├─ Verify 27 policies created
   ├─ Test with different user roles
   └─ Run backend tests: npm test
      │
      ├─ ✅ All checks pass → Task 41 Complete
      └─ ❌ Some checks fail → Review and fix
```

## Decision Tree

```
                    Start Migration
                          │
                          ▼
              ┌───────────────────────┐
              │ Connection Test Pass? │
              └───────────┬───────────┘
                          │
                ┌─────────┴─────────┐
                │                   │
               Yes                 No
                │                   │
                ▼                   ▼
    ┌──────────────────┐   ┌──────────────┐
    │ Run Migration    │   │ Fix .env     │
    │ in Supabase      │   │ Retry Test   │
    └────────┬─────────┘   └──────────────┘
             │
             ▼
    ┌──────────────────┐
    │ Migration        │
    │ Successful?      │
    └────────┬─────────┘
             │
    ┌────────┴────────┐
    │                 │
   Yes               No
    │                 │
    ▼                 ▼
┌─────────────┐  ┌──────────────┐
│ Run Verify  │  │ Check Error  │
│ Script      │  │ Fix & Retry  │
└──────┬──────┘  └──────────────┘
       │
       ▼
┌─────────────┐
│ All Checks  │
│ Pass?       │
└──────┬──────┘
       │
  ┌────┴────┐
  │         │
 Yes       No
  │         │
  ▼         ▼
┌────┐  ┌──────────┐
│Done│  │ Review & │
│ ✅ │  │ Fix      │
└────┘  └──────────┘
```

## Timeline

```
Estimated Time: 10-15 minutes

┌─────────────────────────────────────────────────────────────┐
│ Minute 0-2:   Read documentation & test connection          │
│ Minute 2-5:   Open Supabase, copy/paste migration          │
│ Minute 5-7:   Execute migration                             │
│ Minute 7-10:  Verify tables and run checks                  │
│ Minute 10-15: Complete checklist & documentation           │
└─────────────────────────────────────────────────────────────┘
```

## File Usage Map

```
┌─────────────────────────────────────────────────────────────┐
│                    WHEN TO USE EACH FILE                     │
└─────────────────────────────────────────────────────────────┘

BEFORE MIGRATION:
├─ INDEX.md ..................... Find the right document
├─ QUICK_START.md ............... Fast 5-step guide
├─ EXECUTION_GUIDE.md ........... Detailed instructions
├─ test_connection.js ........... Test Supabase connection
└─ SUMMARY.md ................... Understand what happens

DURING SCHEMA MIGRATION:
├─ 001_initial_schema.sql ....... Main schema migration (run this!)
└─ EXECUTION_GUIDE.md ........... Step-by-step reference

AFTER SCHEMA MIGRATION:
├─ verify_schema.sql ............ Verify schema works
├─ MIGRATION_CHECKLIST.md ....... Complete verification
└─ SUMMARY.md ................... Review what was created

DURING RLS SETUP:
├─ RLS_SETUP_GUIDE.md ........... RLS setup instructions
├─ 002_rls_policies.sql ......... RLS policies (run this!)
└─ apply_rls_migration.js ....... Alternative Node.js method

AFTER RLS SETUP:
├─ verify_rls_policies.sql ...... Verify RLS policies
├─ test_rls_policies.sql ........ RLS testing scenarios
└─ Backend tests ................ npm test

IF PROBLEMS:
├─ EXECUTION_GUIDE.md ........... Troubleshooting section
├─ rollback_001.sql ............. Undo migration
└─ test_connection.js ........... Re-test connection

FOR REFERENCE:
├─ README.md .................... Quick overview
├─ WORKFLOW.md .................. This file
└─ INDEX.md ..................... File directory
```

## Success Criteria

Migration is complete when:

- ✅ Connection test passes
- ✅ Migration executes without errors
- ✅ All 5 tables exist in Table Editor
- ✅ All 5 indexes are created
- ✅ All foreign keys are in place
- ✅ CHECK constraints work correctly
- ✅ Triggers are active
- ✅ Verification script passes all checks
- ✅ MIGRATION_CHECKLIST.md is complete

## Common Paths

### Happy Path (Most Common)
```
test_connection.js → 001_initial_schema.sql → verify_schema.sql → Done ✅
```

### First-Time User Path
```
INDEX.md → QUICK_START.md → test_connection.js → 
EXECUTION_GUIDE.md → 001_initial_schema.sql → 
verify_schema.sql → MIGRATION_CHECKLIST.md → Done ✅
```

### Troubleshooting Path
```
test_connection.js → Failed → Fix .env → Retry →
001_initial_schema.sql → Error → EXECUTION_GUIDE.md →
Fix issue → rollback_001.sql → 001_initial_schema.sql → Done ✅
```

### Detailed Verification Path
```
001_initial_schema.sql → verify_schema.sql → 
MIGRATION_CHECKLIST.md → Manual table inspection → Done ✅
```

## Next Steps After Completion

```
Task 40 Complete ✅
(Schema Migration)
       │
       ▼
┌──────────────────┐
│ Task 41:         │
│ Implement RLS    │
│ Policies ✅      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Task 42:         │
│ Create Storage   │
│ Buckets          │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Task 43:         │
│ Connect Backend  │
│ & Test           │
└──────────────────┘
```

## RLS Migration Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                  RLS POLICIES WORKFLOW                       │
└─────────────────────────────────────────────────────────────┘

1. PREPARATION
   ├─ Ensure schema migration (001) is complete
   ├─ Read RLS_SETUP_GUIDE.md
   └─ Understand RLS policy requirements

2. EXECUTION
   ├─ Open Supabase Dashboard → SQL Editor
   ├─ Copy 002_rls_policies.sql contents
   ├─ Paste and Run
   └─ Check for errors
      │
      ├─ ✅ Success → Continue to Step 3
      └─ ❌ Failed → Check error, fix, retry

3. VERIFICATION
   ├─ Run verify_rls_policies.sql
   ├─ Check all 5 tables have RLS enabled
   ├─ Verify 27 policies created
   └─ Review policy details
      │
      ├─ ✅ All checks pass → Continue to Step 4
      └─ ❌ Some checks fail → Review and fix

4. TESTING
   ├─ Review test_rls_policies.sql scenarios
   ├─ Run backend tests: npm test
   └─ Test with different user roles
      │
      ├─ ✅ Tests pass → Task 41 Complete ✅
      └─ ❌ Tests fail → Debug and fix
```

## Support Resources

| Issue | Resource |
|-------|----------|
| Connection problems | test_connection.js, EXECUTION_GUIDE.md |
| SQL errors | EXECUTION_GUIDE.md (Troubleshooting) |
| Verification failures | verify_schema.sql, MIGRATION_CHECKLIST.md |
| Understanding schema | SUMMARY.md, 001_initial_schema.sql |
| Need to rollback | rollback_001.sql |
| General questions | README.md, INDEX.md |

---

**Remember:** Take your time, follow the steps, and verify everything works before moving to the next task!
