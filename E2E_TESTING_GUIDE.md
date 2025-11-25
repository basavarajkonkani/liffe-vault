# LifeVault E2E Testing Guide

This guide provides comprehensive instructions for running and maintaining end-to-end tests for the LifeVault application.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Running Tests](#running-tests)
5. [Test Structure](#test-structure)
6. [Test Coverage](#test-coverage)
7. [CI/CD Integration](#cicd-integration)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

## Overview

The LifeVault E2E test suite uses Playwright to test the complete application flow from the user's perspective. Tests cover:

- **Authentication**: OTP verification, PIN setup, login
- **Asset Management**: Upload, view, edit, delete assets
- **Nominee Linking**: Link/unlink nominees, shared asset access
- **Role-Based Access Control**: Owner, Nominee, and Admin permissions

## Prerequisites

### Required Services

Before running tests, ensure the following services are running:

1. **Backend API** (Port 3000)
   ```bash
   cd backend
   npm run dev
   ```

2. **Frontend Application** (Port 5173)
   ```bash
   cd frontend
   npm run dev
   ```

3. **Supabase** (Configured with proper environment variables)
   - Database with tables created
   - RLS policies enabled
   - Storage buckets configured
   - Authentication enabled

### Environment Variables

Ensure both backend and frontend have proper `.env` files:

**Backend (.env)**
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Installation

1. **Install root dependencies** (includes Playwright)
   ```bash
   npm install
   ```

2. **Install Playwright browsers**
   ```bash
   npx playwright install
   ```

3. **Verify installation**
   ```bash
   npx playwright --version
   ```

## Running Tests

### Basic Commands

```bash
# Run all tests (headless)
npm run test:e2e

# Run tests with visible browser
npm run test:e2e:headed

# Run tests in UI mode (interactive)
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug

# Run specific test file
npx playwright test e2e/01-auth-flow.spec.ts

# Run tests matching a pattern
npx playwright test --grep "authentication"

# View test report
npm run test:e2e:report
```

### Advanced Options

```bash
# Run tests on specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run tests with specific number of workers
npx playwright test --workers=1

# Run tests with retries
npx playwright test --retries=2

# Generate test code (record actions)
npm run test:e2e:codegen

# Update snapshots
npx playwright test --update-snapshots
```

## Test Structure

### Directory Layout

```
e2e/
├── 01-auth-flow.spec.ts          # Authentication tests
├── 02-asset-management.spec.ts   # Asset CRUD tests
├── 03-nominee-linking.spec.ts    # Nominee linking tests
├── 04-role-based-access.spec.ts  # RBAC tests
├── helpers.ts                     # Test helper functions
├── setup.ts                       # Test data setup
├── README.md                      # E2E documentation
└── .gitignore                     # Ignore test artifacts
```

### Test Files

#### 01-auth-flow.spec.ts
Tests the complete authentication flow:
- Email validation
- OTP sending
- PIN setup
- Role selection
- PIN login
- Session persistence
- Role-based dashboard access

#### 02-asset-management.spec.ts
Tests asset management functionality:
- Navigate to upload page
- Upload form validation
- File size validation (50MB limit)
- Document upload
- Asset listing in vault
- Category filtering
- Search functionality
- Asset detail view
- Document download
- Asset deletion

#### 03-nominee-linking.spec.ts
Tests nominee linking features:
- Navigate to nominee linking page
- Display available nominees
- Link nominee to asset
- Display linked nominees
- Unlink nominee
- Prevent duplicate linking
- Nominee search
- Nominee access to shared assets
- Download shared documents
- Prevent nominee editing/deletion

#### 04-role-based-access.spec.ts
Tests role-based access control:
- Redirect unauthenticated users
- Prevent non-admin access to admin routes
- Admin user management
- Admin asset management
- Owner permissions (create, edit, delete)
- Nominee permissions (view only)
- Role-appropriate navigation

### Helper Functions

The `helpers.ts` file provides reusable functions:

```typescript
// Navigation
navigateToLogin(page)

// Authentication
completeOTPVerification(page, email)
setupPIN(page, pin, role)
loginWithPIN(page, email, pin)
logout(page)

// Asset Management
uploadTestFile(page, title, category)

// Utilities
waitForToast(page, message)
elementExists(page, selector)
```

## Test Coverage

### Requirements Coverage

The E2E tests cover the following requirements from the specification:

| Requirement | Test File | Description |
|-------------|-----------|-------------|
| 1.1 | 01-auth-flow | OTP authentication |
| 1.2 | 01-auth-flow | OTP verification |
| 2.1 | 01-auth-flow | PIN login |
| 3.1 | 02-asset-management | Asset upload |
| 4.1 | 03-nominee-linking | Nominee linking |
| 5.4 | 04-role-based-access | Nominee permissions |
| 5.5 | 04-role-based-access | Nominee restrictions |
| 6.4 | 04-role-based-access | Admin asset management |
| 6.5 | 04-role-based-access | Admin permissions |

### Test Metrics

- **Total Test Files**: 4
- **Total Test Cases**: ~50+
- **Estimated Run Time**: 5-10 minutes
- **Browser Coverage**: Chromium (can extend to Firefox, WebKit)

## CI/CD Integration

### GitHub Actions

The project includes a GitHub Actions workflow (`.github/workflows/e2e-tests.yml`) that:

1. Sets up Node.js environment
2. Installs dependencies
3. Installs Playwright browsers
4. Starts backend and frontend servers
5. Runs E2E tests
6. Uploads test reports and videos
7. Comments on PRs with test results

### Required Secrets

Configure these secrets in your GitHub repository:

- `JWT_SECRET`: Backend JWT secret
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_KEY`: Supabase service role key
- `SUPABASE_ANON_KEY`: Supabase anonymous key

### Triggering Tests

Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

Manual trigger:
```bash
# From GitHub Actions UI
Actions → E2E Tests → Run workflow
```

## Troubleshooting

### Common Issues

#### 1. Tests Timeout

**Problem**: Tests fail with timeout errors

**Solutions**:
- Verify backend is running on port 3000
- Verify frontend is running on port 5173
- Check network connectivity
- Increase timeout in `playwright.config.ts`

```typescript
use: {
  timeout: 30000, // Increase from default
}
```

#### 2. Authentication Failures

**Problem**: Tests fail during login/authentication

**Solutions**:
- Verify Supabase configuration
- Check JWT_SECRET matches between backend and tests
- Ensure test users exist in database
- Check Supabase Auth is enabled

#### 3. Element Not Found

**Problem**: Tests fail with "element not found" errors

**Solutions**:
- Add `data-testid` attributes to components
- Use more specific selectors
- Wait for element to be visible
- Check if element is in viewport

```typescript
// Good: Use data-testid
await page.click('[data-testid="submit-button"]');

// Better: Wait for element
await page.waitForSelector('[data-testid="submit-button"]');
await page.click('[data-testid="submit-button"]');
```

#### 4. Flaky Tests

**Problem**: Tests pass sometimes and fail other times

**Solutions**:
- Remove hard-coded waits (`page.waitForTimeout`)
- Use Playwright's auto-waiting
- Ensure tests are independent
- Check for race conditions

```typescript
// Bad: Hard-coded wait
await page.waitForTimeout(2000);

// Good: Wait for specific condition
await page.waitForSelector('[data-testid="success-message"]');
```

#### 5. Database State Issues

**Problem**: Tests fail due to existing data

**Solutions**:
- Use unique test data (timestamps)
- Clean up test data after runs
- Use separate test database
- Implement test data factories

### Debug Mode

Run tests in debug mode to step through:

```bash
npx playwright test --debug
```

This opens Playwright Inspector where you can:
- Step through test actions
- Inspect page state
- View console logs
- Take screenshots

### Viewing Artifacts

After test failures:

```bash
# View HTML report
npx playwright show-report

# View trace
npx playwright show-trace test-results/trace.zip

# Screenshots and videos are in test-results/
```

## Best Practices

### 1. Test Independence

Each test should be able to run independently:

```typescript
test.beforeEach(async ({ page }) => {
  // Set up fresh state for each test
  await page.goto('/login');
});

test.afterEach(async ({ page }) => {
  // Clean up after each test
  await logout(page);
});
```

### 2. Use Data Attributes

Add `data-testid` attributes to components:

```tsx
// Component
<button data-testid="submit-button">Submit</button>

// Test
await page.click('[data-testid="submit-button"]');
```

### 3. Avoid Hard-Coded Waits

Use Playwright's built-in waiting:

```typescript
// Bad
await page.waitForTimeout(2000);

// Good
await page.waitForSelector('[data-testid="element"]');
await expect(page.locator('[data-testid="element"]')).toBeVisible();
```

### 4. Use Page Objects

For complex pages, create page object models:

```typescript
class LoginPage {
  constructor(private page: Page) {}

  async login(email: string, pin: string) {
    await this.page.fill('[data-testid="email"]', email);
    await this.page.fill('[data-testid="pin"]', pin);
    await this.page.click('[data-testid="submit"]');
  }
}
```

### 5. Test Data Management

Use factories for consistent test data:

```typescript
const createTestUser = () => ({
  email: `test-${Date.now()}@example.com`,
  pin: '123456',
  role: 'owner',
});
```

### 6. Error Handling

Handle expected errors gracefully:

```typescript
test('should handle network errors', async ({ page }) => {
  await page.route('**/api/**', route => route.abort());
  
  await page.goto('/dashboard');
  
  await expect(page.locator('[data-testid="error-message"]'))
    .toContainText('Network error');
});
```

### 7. Accessibility Testing

Include accessibility checks:

```typescript
import { injectAxe, checkA11y } from 'axe-playwright';

test('should be accessible', async ({ page }) => {
  await page.goto('/login');
  await injectAxe(page);
  await checkA11y(page);
});
```

## Future Improvements

1. **Page Object Models**: Implement POM pattern for better maintainability
2. **Test Data Factory**: Create factory functions for consistent test data
3. **Visual Regression**: Add visual comparison tests
4. **API Mocking**: Mock external API calls for faster tests
5. **Performance Testing**: Add performance metrics collection
6. **Accessibility Testing**: Integrate axe-core for a11y testing
7. **Test Data Cleanup**: Automated cleanup scripts
8. **Parallel Execution**: Enable parallel test execution
9. **Cross-Browser Testing**: Extend to Firefox and WebKit
10. **Mobile Testing**: Add mobile viewport tests

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Playwright GitHub](https://github.com/microsoft/playwright)

## Support

For issues or questions:

1. Check this guide and the E2E README
2. Review Playwright documentation
3. Check test output and reports
4. Verify environment configuration
5. Review application logs (backend and frontend)

## Contributing

When adding new tests:

1. Follow existing test structure
2. Use helper functions from `helpers.ts`
3. Add appropriate `data-testid` attributes to components
4. Document test purpose and requirements coverage
5. Ensure tests are independent and can run in any order
6. Update this guide with new patterns or solutions
