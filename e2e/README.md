# LifeVault E2E Tests

End-to-end tests for the LifeVault application using Playwright.

## Overview

These tests cover the complete user flows and functionality of the LifeVault application:

1. **Authentication Flow** (`01-auth-flow.spec.ts`)
   - User registration with OTP
   - PIN setup and role selection
   - PIN login
   - Session persistence
   - Role-based dashboard access

2. **Asset Management** (`02-asset-management.spec.ts`)
   - Asset creation and upload
   - Document upload with file size validation
   - Asset viewing and filtering
   - Asset editing and deletion
   - Document download

3. **Nominee Linking** (`03-nominee-linking.spec.ts`)
   - Linking nominees to assets
   - Unlinking nominees
   - Viewing linked nominees
   - Nominee access to shared assets
   - Permission restrictions for nominees

4. **Role-Based Access Control** (`04-role-based-access.spec.ts`)
   - Asset Owner permissions
   - Nominee permissions
   - Admin permissions
   - Unauthorized access prevention
   - Role-appropriate navigation

## Prerequisites

Before running the tests, ensure:

1. **Backend is running** on `http://localhost:3000`
2. **Frontend is running** on `http://localhost:5173`
3. **Supabase is configured** with proper environment variables
4. **Test data is available** (or tests will create it)

## Installation

Install Playwright and browsers:

```bash
npm install
npx playwright install
```

## Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Run tests in UI mode (interactive)
```bash
npm run test:e2e:ui
```

### Run specific test file
```bash
npx playwright test e2e/01-auth-flow.spec.ts
```

### Run tests in debug mode
```bash
npx playwright test --debug
```

## Test Configuration

The tests are configured in `playwright.config.ts`:

- **Base URL**: `http://localhost:5173` (frontend)
- **Browsers**: Chromium (can be extended to Firefox, WebKit)
- **Parallel execution**: Disabled for data consistency
- **Retries**: 2 on CI, 0 locally
- **Screenshots**: On failure
- **Videos**: On failure
- **Traces**: On first retry

## Test Data

The tests use dynamic test data generated at runtime:

```typescript
TEST_USERS = {
  owner: { email: 'owner-{timestamp}@test.com', pin: '123456' },
  nominee: { email: 'nominee-{timestamp}@test.com', pin: '654321' },
  admin: { email: 'admin-{timestamp}@test.com', pin: '111111' },
}
```

## Important Notes

### OTP Verification

The current tests have a limitation with OTP verification since it requires:
- Access to email inbox to retrieve OTP
- Or Supabase test mode configuration

For production testing, you should:
1. Use a test email service (e.g., Mailinator, Mailtrap)
2. Configure Supabase test mode
3. Or mock the OTP verification endpoint

### Authentication State

Some tests require authenticated users. You may need to:
1. Create test users manually in Supabase
2. Use a setup script to create test data
3. Or modify tests to handle authentication setup

### Database State

Tests may create data in the database. Consider:
1. Using a separate test database
2. Cleaning up test data after runs
3. Or using database transactions that can be rolled back

## CI/CD Integration

To run tests in CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
- name: Install dependencies
  run: npm install

- name: Install Playwright browsers
  run: npx playwright install --with-deps

- name: Start backend
  run: cd backend && npm run dev &

- name: Start frontend
  run: cd frontend && npm run dev &

- name: Wait for services
  run: sleep 10

- name: Run E2E tests
  run: npm run test:e2e

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Viewing Test Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

## Debugging Failed Tests

1. **View screenshots**: Check `test-results/` directory
2. **View videos**: Check `test-results/` directory
3. **View traces**: Use Playwright trace viewer
   ```bash
   npx playwright show-trace test-results/trace.zip
   ```
4. **Run in headed mode**: See the browser actions
   ```bash
   npx playwright test --headed
   ```
5. **Use debug mode**: Step through tests
   ```bash
   npx playwright test --debug
   ```

## Best Practices

1. **Keep tests independent**: Each test should be able to run standalone
2. **Use data-testid attributes**: Add to components for reliable selectors
3. **Avoid hard-coded waits**: Use Playwright's auto-waiting features
4. **Clean up test data**: Remove created data after tests
5. **Use page objects**: For complex pages, create page object models
6. **Mock external services**: When possible, mock third-party APIs

## Troubleshooting

### Tests timing out
- Increase timeout in `playwright.config.ts`
- Check if backend/frontend are running
- Verify network connectivity

### Authentication failures
- Verify Supabase configuration
- Check JWT_SECRET matches between backend and tests
- Ensure test users exist in database

### Element not found
- Add data-testid attributes to components
- Use more specific selectors
- Check if element is in viewport

### Flaky tests
- Avoid hard-coded waits
- Use Playwright's built-in waiting mechanisms
- Ensure tests are independent

## Future Improvements

1. Add page object models for better maintainability
2. Implement test data factory for consistent test data
3. Add visual regression testing
4. Implement API mocking for external services
5. Add performance testing with Playwright
6. Create test data cleanup scripts
7. Add accessibility testing with axe-core

## Requirements Coverage

These tests cover the following requirements:

- **1.1**: OTP authentication flow
- **1.2**: OTP verification
- **2.1**: PIN login
- **3.1**: Asset upload
- **4.1**: Nominee linking
- **5.4**: Nominee permissions
- **5.5**: Nominee access restrictions
- **6.4**: Admin asset management
- **6.5**: Admin permissions

## Support

For issues or questions:
1. Check Playwright documentation: https://playwright.dev
2. Review test output and reports
3. Check application logs (backend and frontend)
4. Verify environment configuration
