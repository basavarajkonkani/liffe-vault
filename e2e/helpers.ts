import { Page, expect } from '@playwright/test';

/**
 * Helper functions for E2E tests
 */

export const TEST_USERS = {
  owner: {
    email: `owner-${Date.now()}@test.com`,
    pin: '123456',
    role: 'Asset Owner',
  },
  nominee: {
    email: `nominee-${Date.now()}@test.com`,
    pin: '654321',
    role: 'Nominee',
  },
  admin: {
    email: `admin-${Date.now()}@test.com`,
    pin: '111111',
    role: 'Admin',
  },
};

export const TEST_ASSET = {
  title: 'Test Legal Document',
  category: 'Legal',
};

/**
 * Navigate to login page
 */
export async function navigateToLogin(page: Page) {
  await page.goto('/');
  await expect(page).toHaveURL(/.*login/);
}

/**
 * Complete OTP verification flow (mock)
 * Note: In real tests, you'd need to handle actual OTP from email
 */
export async function completeOTPVerification(page: Page, email: string) {
  // Fill email
  await page.fill('input[type="email"]', email);
  await page.click('button[type="submit"]');
  
  // Wait for OTP page
  await expect(page).toHaveURL(/.*otp-verify/);
  
  // Note: In a real scenario, you'd need to retrieve the OTP from email
  // For testing purposes, we'll assume OTP is sent and enter a test OTP
  // This would require a test email service or Supabase test mode
  await page.waitForTimeout(1000);
}

/**
 * Complete PIN setup
 */
export async function setupPIN(page: Page, pin: string, role: string) {
  // Wait for PIN setup page
  await expect(page).toHaveURL(/.*pin-setup/);
  
  // Fill PIN
  const pinInputs = page.locator('input[type="password"]');
  await pinInputs.first().fill(pin);
  await pinInputs.last().fill(pin);
  
  await page.click('button[type="submit"]');
  
  // Wait for role selector
  await expect(page).toHaveURL(/.*role-select/);
  
  // Select role
  await page.click(`text=${role}`);
  
  // Wait for redirect to login
  await expect(page).toHaveURL(/.*login/);
}

/**
 * Login with PIN
 */
export async function loginWithPIN(page: Page, email: string, pin: string) {
  await page.goto('/login');
  
  // Fill email
  await page.fill('input[type="email"]', email);
  
  // Fill PIN
  await page.fill('input[type="password"]', pin);
  
  // Submit
  await page.click('button[type="submit"]');
  
  // Wait for dashboard
  await page.waitForURL(/.*dashboard/, { timeout: 10000 });
}

/**
 * Logout
 */
export async function logout(page: Page) {
  // Click user menu
  await page.click('[data-testid="user-menu"]', { timeout: 5000 }).catch(() => {
    // Try alternative selector
    return page.click('button:has-text("Logout")');
  });
  
  // Click logout
  await page.click('text=Logout');
  
  // Wait for redirect to login
  await expect(page).toHaveURL(/.*login/);
}

/**
 * Upload a test file
 */
export async function uploadTestFile(page: Page, title: string, category: string) {
  // Navigate to upload page
  await page.click('text=Upload');
  await expect(page).toHaveURL(/.*upload/);
  
  // Fill form
  await page.fill('input[name="title"]', title);
  await page.selectOption('select[name="category"]', category);
  
  // Create a test file
  const fileContent = 'This is a test document for E2E testing';
  const buffer = Buffer.from(fileContent);
  
  // Upload file
  await page.setInputFiles('input[type="file"]', {
    name: 'test-document.txt',
    mimeType: 'text/plain',
    buffer: buffer,
  });
  
  // Submit
  await page.click('button[type="submit"]');
  
  // Wait for success
  await page.waitForTimeout(2000);
}

/**
 * Wait for toast message
 */
export async function waitForToast(page: Page, message: string) {
  await expect(page.locator(`text=${message}`)).toBeVisible({ timeout: 5000 });
}

/**
 * Check if element exists
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}
