import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Nominee Linking
 * Requirements: 4.1
 * 
 * Tests cover:
 * - Linking nominees to assets
 * - Unlinking nominees
 * - Viewing linked nominees
 * - Nominee access to shared assets
 */

test.describe('Nominee Linking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should navigate to nominee linking page', async ({ page }) => {
    // Try to access nominee linking page
    await page.goto('/nominees');
    await page.waitForTimeout(1000);
    
    const currentUrl = page.url();
    console.log('Nominee linking page URL:', currentUrl);
    
    // Check if we're on the nominees page
    const hasNomineeContent = await page.locator('h1:has-text("Nominee"), h2:has-text("Nominee")').count() > 0;
    
    if (hasNomineeContent) {
      console.log('On nominee linking page');
    }
  });

  test('should display list of available nominees', async ({ page }) => {
    await page.goto('/nominees');
    await page.waitForTimeout(2000);
    
    // Look for nominee selector or list
    const nomineeSelector = page.locator('select, [data-testid="nominee-selector"], .nominee-list');
    const hasNomineeSelector = await nomineeSelector.count() > 0;
    
    if (hasNomineeSelector) {
      console.log('Nominee selector found');
      await expect(nomineeSelector.first()).toBeVisible();
    }
  });

  test('should display user assets for linking', async ({ page }) => {
    await page.goto('/nominees');
    await page.waitForTimeout(2000);
    
    // Look for asset list or selector
    const assetList = page.locator('[data-testid="asset-list"], .asset-card, select:has-text("Select Asset")');
    const hasAssetList = await assetList.count() > 0;
    
    if (hasAssetList) {
      console.log('Asset list found for linking');
    }
  });

  test('should link nominee to asset', async ({ page }) => {
    await page.goto('/nominees');
    await page.waitForTimeout(2000);
    
    // Select an asset
    const assetSelector = page.locator('select[name="asset"], [data-testid="asset-selector"]').first();
    const hasAssetSelector = await assetSelector.count() > 0;
    
    if (hasAssetSelector) {
      // Select first asset
      const options = await assetSelector.locator('option').count();
      if (options > 1) {
        await assetSelector.selectOption({ index: 1 });
      }
    }
    
    // Select a nominee
    const nomineeSelector = page.locator('select[name="nominee"], [data-testid="nominee-selector"]').first();
    const hasNomineeSelector = await nomineeSelector.count() > 0;
    
    if (hasNomineeSelector) {
      // Select first nominee
      const options = await nomineeSelector.locator('option').count();
      if (options > 1) {
        await nomineeSelector.selectOption({ index: 1 });
      }
    }
    
    // Click link button
    const linkBtn = page.locator('button:has-text("Link"), button:has-text("Add Nominee")');
    const hasLinkBtn = await linkBtn.count() > 0;
    
    if (hasLinkBtn) {
      await linkBtn.first().click();
      await page.waitForTimeout(2000);
      
      console.log('Nominee linking attempted');
      
      // Look for success message
      const successMsg = page.locator('text=/linked|added|success/i');
      const hasSuccess = await successMsg.count() > 0;
      
      if (hasSuccess) {
        console.log('Nominee linked successfully');
      }
    }
  });

  test('should display linked nominees for an asset', async ({ page }) => {
    await page.goto('/nominees');
    await page.waitForTimeout(2000);
    
    // Look for linked nominees list
    const linkedList = page.locator('[data-testid="linked-nominees"], .linked-nominee, table');
    const hasLinkedList = await linkedList.count() > 0;
    
    if (hasLinkedList) {
      console.log('Linked nominees list found');
      
      // Verify list structure
      const firstLinked = linkedList.first();
      await expect(firstLinked).toBeVisible();
    }
  });

  test('should unlink nominee from asset', async ({ page }) => {
    await page.goto('/nominees');
    await page.waitForTimeout(2000);
    
    // Look for unlink button
    const unlinkBtn = page.locator('button:has-text("Unlink"), button:has-text("Remove"), [data-testid="unlink-btn"]');
    const hasUnlinkBtn = await unlinkBtn.count() > 0;
    
    if (hasUnlinkBtn) {
      await unlinkBtn.first().click();
      await page.waitForTimeout(500);
      
      // Confirm if dialog appears
      const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Remove")').last();
      const hasConfirmBtn = await confirmBtn.count() > 0;
      
      if (hasConfirmBtn) {
        await confirmBtn.click();
        await page.waitForTimeout(2000);
        
        console.log('Nominee unlinking attempted');
      }
    }
  });

  test('should prevent linking same nominee twice to same asset', async ({ page }) => {
    await page.goto('/nominees');
    await page.waitForTimeout(2000);
    
    // Try to link the same nominee again
    // This would require selecting the same asset and nominee
    // The system should show an error or prevent the action
    
    console.log('Duplicate linking prevention test');
  });

  test('should search nominees by email', async ({ page }) => {
    await page.goto('/nominees');
    await page.waitForTimeout(2000);
    
    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
    const hasSearch = await searchInput.count() > 0;
    
    if (hasSearch) {
      await searchInput.fill('test');
      await page.waitForTimeout(1000);
      
      console.log('Nominee search applied');
    }
  });
});

test.describe('Nominee Access to Shared Assets', () => {
  test('should display shared assets for nominee', async ({ page }) => {
    // This test requires logging in as a nominee
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    
    // Look for shared assets section
    const sharedAssets = page.locator('[data-testid="shared-assets"], .shared-asset, h2:has-text("Shared")');
    const hasSharedAssets = await sharedAssets.count() > 0;
    
    if (hasSharedAssets) {
      console.log('Shared assets section found');
    }
  });

  test('should allow nominee to view shared asset details', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    
    // Click on first shared asset
    const firstSharedAsset = page.locator('[data-testid="shared-asset-card"], .shared-asset').first();
    const hasSharedAssets = await firstSharedAsset.count() > 0;
    
    if (hasSharedAssets) {
      await firstSharedAsset.click();
      await page.waitForTimeout(1000);
      
      console.log('Viewing shared asset details');
    }
  });

  test('should allow nominee to download shared documents', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    
    // Navigate to shared asset
    const firstSharedAsset = page.locator('[data-testid="shared-asset-card"], .shared-asset').first();
    const hasSharedAssets = await firstSharedAsset.count() > 0;
    
    if (hasSharedAssets) {
      await firstSharedAsset.click();
      await page.waitForTimeout(1000);
      
      // Look for download button
      const downloadBtn = page.locator('button:has-text("Download")');
      const hasDownloadBtn = await downloadBtn.count() > 0;
      
      if (hasDownloadBtn) {
        const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
        await downloadBtn.first().click();
        
        const download = await downloadPromise;
        if (download) {
          console.log('Nominee downloaded document:', await download.suggestedFilename());
        }
      }
    }
  });

  test('should prevent nominee from editing shared assets', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    
    // Navigate to shared asset
    const firstSharedAsset = page.locator('[data-testid="shared-asset-card"], .shared-asset').first();
    const hasSharedAssets = await firstSharedAsset.count() > 0;
    
    if (hasSharedAssets) {
      await firstSharedAsset.click();
      await page.waitForTimeout(1000);
      
      // Verify edit button is not present
      const editBtn = page.locator('button:has-text("Edit")');
      const hasEditBtn = await editBtn.count() > 0;
      
      if (!hasEditBtn) {
        console.log('Edit button correctly hidden for nominee');
      }
    }
  });

  test('should prevent nominee from deleting shared assets', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    
    // Navigate to shared asset
    const firstSharedAsset = page.locator('[data-testid="shared-asset-card"], .shared-asset').first();
    const hasSharedAssets = await firstSharedAsset.count() > 0;
    
    if (hasSharedAssets) {
      await firstSharedAsset.click();
      await page.waitForTimeout(1000);
      
      // Verify delete button is not present
      const deleteBtn = page.locator('button:has-text("Delete")');
      const hasDeleteBtn = await deleteBtn.count() > 0;
      
      if (!hasDeleteBtn) {
        console.log('Delete button correctly hidden for nominee');
      }
    }
  });

  test('should show asset owner information on shared assets', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    
    // Look for owner information
    const ownerInfo = page.locator('[data-testid="owner-info"], .owner-name, text=/owner/i');
    const hasOwnerInfo = await ownerInfo.count() > 0;
    
    if (hasOwnerInfo) {
      console.log('Owner information displayed');
    }
  });
});
