import { test, expect } from '@playwright/test';
import { setupExternalServiceMocks, mockResponses } from './mocks';
import { globalTestCleanup } from './cleanup-utils.spec';

const BASE_URL = 'http://localhost:3000';

test.describe('Upgrade FREE to PRO via Khalti Payment', () => {
  test.beforeEach(async ({ page }) => {
    // Apply all external service mocks before each test
    await setupExternalServiceMocks(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    console.log(`Test "${testInfo.title}" completed. Status: ${testInfo.status}`);
    await globalTestCleanup();
  });

  test('Successful upgrade from FREE to PRO via Khalti', async ({ page }) => {
    console.log('Starting FREE to PRO upgrade test...');
    
    // Start with a free user on dashboard
    await page.goto(`${BASE_URL}/dashboard`);
    
    // Verify starting as FREE user
    await expect(page.locator('text=FREE').first()).toBeVisible({ timeout: 10000 });
    
    // Navigate to subscription page
    await page.locator('text=Subscription').click();
    await page.waitForURL('**/dashboard/subscription');
    
    // Wait for plans to load
    await expect(page.locator('text=FREE')).toBeVisible();
    await expect(page.locator('text=PRO')).toBeVisible();
    
    // Select PRO plan and click upgrade
    const upgradeButton = page.locator('button:has-text("Upgrade to PRO"), button:has-text("Subscribe to PRO"), button:has-text("Pay")').first();
    await expect(upgradeButton).toBeVisible();
    await upgradeButton.click();
    
    // Wait for Khalti payment initiation
    await page.waitForTimeout(2000);
    
    // Simulate successful payment completion using callback
    const searchParams = new URLSearchParams({
      success: 'true',
      plan: 'PRO',
      pidx: mockResponses.khalti.initiate.pidx
    });
    
    await page.goto(`${BASE_URL}/dashboard/subscription/payment?${searchParams.toString()}`);
    
    // Wait for state update
    await page.waitForTimeout(3000);
    
    // Go back to dashboard to verify plan upgrade
    await page.goto(`${BASE_URL}/dashboard`);
    
    // Verify user is now PRO
    await expect(page.locator('text=PRO, text=pro').first()).toBeVisible({ timeout: 10000 });
    
    // Verify PRO features are now available
    await expect(page.locator('text=AI Settings, text=Advanced Settings')).toBeVisible();
    
    console.log('✓ Successfully upgraded from FREE to PRO via Khalti');
  });
});