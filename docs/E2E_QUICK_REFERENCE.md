# E2E Testing Quick Reference

Quick reference guide for running and debugging E2E tests in LifeVault.

## Prerequisites

```bash
# Terminal 1: Start backend
cd backend && npm run dev

# Terminal 2: Start frontend  
cd frontend && npm run dev
```

## Run Tests

```bash
# Quick start (checks services automatically)
./run-e2e-tests.sh

# All tests (headless)
npm run test:e2e

# With visible browser
npm run test:e2e:headed

# Interactive UI mode
npm run test:e2e:ui

# Debug mode (step through)
npm run test:e2e:debug

# Specific test file
npx playwright test e2e/01-auth-flow.spec.ts

# Specific test by name
npx playwright test --grep "should login"

# View report
npm run test:e2e:report
```

## Test Files

| File | Tests | Coverage |
|------|-------|----------|
| `01-auth-flow.spec.ts` | 10 | Authentication, OTP, PIN login |
| `02-asset-management.spec.ts` | 11 | Upload, view, edit, delete assets |
| `03-nominee-linking.spec.ts` | 14 | Link nominees, shared access |
| `04-role-based-access.spec.ts` | 22 | Owner, Nominee, Admin permissions |

## Common Commands

```bash
# Generate test code (record actions)
npm run test:e2e:codegen

# Run on specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox

# Run with retries
npx playwright test --retries=2

# Run single worker (no parallel)
npx playwright test --workers=1

# Update snapshots
npx playwright test --update-snapshots

# Show trace viewer
npx playwright show-trace test-results/trace.zip
```

## Debug Failed Tests

```bash
# 1. View HTML report
npm run test:e2e:report

# 2. Check screenshots
ls test-results/

# 3. View videos
open test-results/*.webm

# 4. Run in debug mode
npm run test:e2e:debug

# 5. Run with headed browser
npm run test:e2e:headed
```

## Helper Functions

```typescript
import { 
  navigateToLogin,
  loginWithPIN,
  logout,
  uploadTestFile,
  waitForToast,
  elementExists,
  TEST_USERS,
  TEST_ASSET
} from './helpers';

// Use in tests
await navigateToLogin(page);
await loginWithPIN(page, TEST_USERS.owner.email, TEST_USERS.owner.pin);
await uploadTestFile(page, TEST_ASSET.title, TEST_ASSET.category);
```

## Test Data

```typescript
TEST_USERS = {
  owner: { email: 'owner-{timestamp}@test.com', pin: '123456' },
  nominee: { email: 'nominee-{timestamp}@test.com', pin: '654321' },
  admin: { email: 'admin-{timestamp}@test.com', pin: '111111' }
}

TEST_ASSET = {
  title: 'Test Legal Document',
  category: 'Legal'
}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Tests timeout | Check backend/frontend are running |
| Auth failures | Verify Supabase config, check JWT_SECRET |
| Element not found | Add data-testid attributes, use specific selectors |
| Flaky tests | Remove hard waits, use Playwright auto-waiting |
| Database issues | Use unique test data, clean up after tests |

## CI/CD

Tests run automatically on:
- Push to `main` or `develop`
- Pull requests

View results in GitHub Actions → E2E Tests

## Documentation

- **Full Guide**: [E2E_TESTING_GUIDE.md](./E2E_TESTING_GUIDE.md)
- **Implementation**: [E2E_IMPLEMENTATION_SUMMARY.md](./E2E_IMPLEMENTATION_SUMMARY.md)
- **E2E README**: [e2e/README.md](./e2e/README.md)
- **Completion Report**: [TASK_49_COMPLETION.md](./TASK_49_COMPLETION.md)

## Quick Tips

✅ Always start backend and frontend before running tests  
✅ Use helper script for automatic service checks  
✅ Run in UI mode for interactive debugging  
✅ Check HTML report for detailed results  
✅ Use data-testid attributes for reliable selectors  
✅ Keep tests independent and idempotent  
✅ Use Playwright's auto-waiting, avoid hard waits  

## Support

For issues:
1. Check [E2E_TESTING_GUIDE.md](./E2E_TESTING_GUIDE.md) troubleshooting section
2. View test report: `npm run test:e2e:report`
3. Run in debug mode: `npm run test:e2e:debug`
4. Check Playwright docs: https://playwright.dev
