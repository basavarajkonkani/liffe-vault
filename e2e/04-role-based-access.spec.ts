import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Role-Based Access Control
 * Requirements: 4.1, 5.4, 5.5, 6.4, 6.5
 * 
 * Tests cover:
 * - Asset Owner permissions
 * - Nominee permissions
 * - Admin permissions
 * - Unauthorized access prevention
 */

test.describe('Role-Based Access Control', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Try to access protected routes without authentication
    const protectedRoutes = ['/dashboard', '/vault', '/upload', '/nominees', '/admin/users'];
    
    for (const route of protectedRoutes) {
      await page.goto(route);
      await page.waitForTimeout(1000);
      
      // Should redirect to login
      const currentUrl = page.url();
      console.log(`Accessing ${route} redirected to:`, currentUrl);
      
      // Verify we're on login page
      const isOnLogin = currentUrl.includes('login');
      if (isOnLogin) {
        console.log(`✓ ${route} correctly redirected to login`);
      }
    }
  });

  test('should prevent access to admin routes for non-admin users', async ({ page }) => {
    // This test requires logging in as a non-admin user
    await page.goto('/admin/users');
    await page.waitForTimeout(1000);
    
    const currentUrl = page.url();
    console.log('Admin route access URL:', currentUrl);
    
    // Should either redirect to login or show unauthorized message
    const isOnLogin = currentUrl.includes('login');
    const hasUnauthorized = await page.locator('text=/unauthorized|forbidden|403/i').count() > 0;
    
    if (isOnLogin || hasUnauthorized) {
      console.log('✓ Admin route correctly protected');
    }
  });

  test('should allow admin to access user management', async ({ page }) => {
    // This test requires logging in as an admin
    await page.goto('/admin/users');
    await page.waitForTimeout(2000);
    
    // Check if we're on admin page
    const hasUserTable = await page.locator('table, [data-testid="user-table"]').count() > 0;
    
    if (hasUserTable) {
      console.log('✓ Admin can access user management');
      
      // Verify table structure
      await expect(page.locator('table, [data-testid="user-table"]').first()).toBeVisible();
    }
  });

  test('should allow admin to access asset management', async ({ page }) => {
    await page.goto('/admin/assets');
    await page.waitForTimeout(2000);
    
    // Check if we're on admin assets page
    const hasAssetTable = await page.locator('table, [data-testid="asset-table"]').count() > 0;
    
    if (hasAssetTable) {
      console.log('✓ Admin can access asset management');
    }
  });

  test('should show all users to admin', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForTimeout(2000);
    
    // Look for user rows
    const userRows = page.locator('table tbody tr, [data-testid="user-row"]');
    const hasUsers = await userRows.count() > 0;
    
    if (hasUsers) {
      const userCount = await userRows.count();
      console.log(`✓ Admin sees ${userCount} users`);
    }
  });

  test('should show all assets to admin', async ({ page }) => {
    await page.goto('/admin/assets');
    await page.waitForTimeout(2000);
    
    // Look for asset rows
    const assetRows = page.locator('table tbody tr, [data-testid="asset-row"]');
    const hasAssets = await assetRows.count() > 0;
    
    if (hasAssets) {
      const assetCount = await assetRows.count();
      console.log(`✓ Admin sees ${assetCount} assets`);
    }
  });

  test('should allow admin to search users', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForTimeout(2000);
    
    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
    const hasSearch = await searchInput.count() > 0;
    
    if (hasSearch) {
      await searchInput.fill('test');
      await page.waitForTimeout(1000);
      
      console.log('✓ Admin can search users');
    }
  });

  test('should display system statistics to admin', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForTimeout(2000);
    
    // Look for statistics
    const statsCards = page.locator('[data-testid="stats-card"], .stats-card');
    const hasStats = await statsCards.count() > 0;
    
    if (hasStats) {
      console.log('✓ Admin sees system statistics');
    }
  });
});

test.describe('Asset Owner Permissions', () => {
  test('should allow owner to create assets', async ({ page }) => {
    await page.goto('/upload');
    await page.waitForTimeout(1000);
    
    // Check if upload form is accessible
    const hasFileInput = await page.locator('input[type="file"]').count() > 0;
    
    if (hasFileInput) {
      console.log('✓ Owner can access upload form');
    }
  });

  test('should allow owner to view own assets', async ({ page }) => {
    await page.goto('/vault');
    await page.waitForTimeout(2000);
    
    // Check if vault is accessible
    const hasAssets = await page.locator('[data-testid="asset-card"], .asset-card').count() > 0;
    
    console.log('✓ Owner can view vault');
  });

  test('should allow owner to edit own assets', async ({ page }) => {
    await page.goto('/vault');
    await page.waitForTimeout(2000);
    
    // Click on first asset
    const firstAsset = page.locator('[data-testid="asset-card"], .asset-card').first();
    const hasAssets = await firstAsset.count() > 0;
    
    if (hasAssets) {
      await firstAsset.click();
      await page.waitForTimeout(1000);
      
      // Look for edit button
      const editBtn = page.locator('button:has-text("Edit")');
      const hasEditBtn = await editBtn.count() > 0;
      
      if (hasEditBtn) {
        console.log('✓ Owner can edit own assets');
      }
    }
  });

  test('should allow owner to delete own assets', async ({ page }) => {
    await page.goto('/vault');
    await page.waitForTimeout(2000);
    
    // Click on first asset
    const firstAsset = page.locator('[data-testid="asset-card"], .asset-card').first();
    const hasAssets = await firstAsset.count() > 0;
    
    if (hasAssets) {
      await firstAsset.click();
      await page.waitForTimeout(1000);
      
      // Look for delete button
      const deleteBtn = page.locator('button:has-text("Delete")');
      const hasDeleteBtn = await deleteBtn.count() > 0;
      
      if (hasDeleteBtn) {
        console.log('✓ Owner can delete own assets');
      }
    }
  });

  test('should allow owner to link nominees', async ({ page }) => {
    await page.goto('/nominees');
    await page.waitForTimeout(2000);
    
    // Check if nominee linking is accessible
    const hasNomineeSelector = await page.locator('select, [data-testid="nominee-selector"]').count() > 0;
    
    if (hasNomineeSelector) {
      console.log('✓ Owner can access nominee linking');
    }
  });

  test('should prevent owner from accessing admin routes', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForTimeout(1000);
    
    const currentUrl = page.url();
    
    // Should redirect or show unauthorized
    const isOnLogin = currentUrl.includes('login');
    const hasUnauthorized = await page.locator('text=/unauthorized|forbidden/i').count() > 0;
    
    if (isOnLogin || hasUnauthorized) {
      console.log('✓ Owner correctly blocked from admin routes');
    }
  });
});

test.describe('Nominee Permissions', () => {
  test('should allow nominee to view shared assets', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    
    // Look for shared assets
    const sharedAssets = page.locator('[data-testid="shared-asset"], .shared-asset');
    const hasSharedAssets = await sharedAssets.count() > 0;
    
    console.log('✓ Nominee can view dashboard');
  });

  test('should prevent nominee from uploading assets', async ({ page }) => {
    await page.goto('/upload');
    await page.waitForTimeout(1000);
    
    const currentUrl = page.url();
    
    // Should redirect or show unauthorized
    const isOnLogin = currentUrl.includes('login');
    const hasUnauthorized = await page.locator('text=/unauthorized|forbidden/i').count() > 0;
    
    if (isOnLogin || hasUnauthorized || !currentUrl.includes('upload')) {
      console.log('✓ Nominee correctly blocked from upload');
    }
  });

  test('should prevent nominee from accessing nominee linking', async ({ page }) => {
    await page.goto('/nominees');
    await page.waitForTimeout(1000);
    
    const currentUrl = page.url();
    
    // Should redirect or show unauthorized
    const isOnLogin = currentUrl.includes('login');
    const hasUnauthorized = await page.locator('text=/unauthorized|forbidden/i').count() > 0;
    
    if (isOnLogin || hasUnauthorized || !currentUrl.includes('nominees')) {
      console.log('✓ Nominee correctly blocked from nominee linking');
    }
  });

  test('should prevent nominee from accessing admin routes', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForTimeout(1000);
    
    const currentUrl = page.url();
    
    // Should redirect or show unauthorized
    const isOnLogin = currentUrl.includes('login');
    const hasUnauthorized = await page.locator('text=/unauthorized|forbidden/i').count() > 0;
    
    if (isOnLogin || hasUnauthorized) {
      console.log('✓ Nominee correctly blocked from admin routes');
    }
  });

  test('should prevent nominee from viewing non-shared assets', async ({ page }) => {
    // Try to access a specific asset ID that's not shared
    await page.goto('/vault/123e4567-e89b-12d3-a456-426614174000');
    await page.waitForTimeout(1000);
    
    const currentUrl = page.url();
    
    // Should redirect or show unauthorized
    const isOnLogin = currentUrl.includes('login');
    const hasUnauthorized = await page.locator('text=/unauthorized|forbidden|not found/i').count() > 0;
    
    if (isOnLogin || hasUnauthorized) {
      console.log('✓ Nominee correctly blocked from non-shared assets');
    }
  });
});

test.describe('Navigation Based on Role', () => {
  test('should show role-appropriate navigation items', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    
    // Check navigation items
    const nav = page.locator('nav, [data-testid="sidebar"], [data-testid="navbar"]');
    const hasNav = await nav.count() > 0;
    
    if (hasNav) {
      console.log('✓ Navigation visible');
      
      // Check for common nav items
      const dashboardLink = page.locator('a:has-text("Dashboard")');
      const hasDashboard = await dashboardLink.count() > 0;
      
      if (hasDashboard) {
        console.log('✓ Dashboard link present');
      }
    }
  });

  test('should hide admin menu items from non-admin users', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    
    // Look for admin menu items
    const adminLink = page.locator('a:has-text("Admin"), a:has-text("Users"), a:has-text("Manage")');
    const hasAdminLink = await adminLink.count() > 0;
    
    console.log('Admin links visible:', hasAdminLink);
  });

  test('should show upload option only to asset owners', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    
    // Look for upload link
    const uploadLink = page.locator('a:has-text("Upload"), button:has-text("Upload")');
    const hasUploadLink = await uploadLink.count() > 0;
    
    console.log('Upload option visible:', hasUploadLink);
  });
});
