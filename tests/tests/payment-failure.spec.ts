import { test, expect } from '@playwright/test';
import { setupExternalServiceMocks, mockResponses } from './mocks';
import { globalTestCleanup } from './cleanup-utils.spec';

const BASE_URL = 'http://localhost:3000';

test.describe('Payment Failure - Remains FREE', () => {
  test.beforeEach(async ({ page }) => {
    // Apply all external service mocks before each test
    await setupExternalServiceMocks(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    console.log(`Test "${testInfo.title}" completed. Status: ${testInfo.status}`);
    await globalTestCleanup();
  });

  test('Payment fails and user remains FREE', async ({ page }) => {
    console.log('Starting payment failure test...');
    
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
    
    // Wait for payment process to start
    await page.waitForTimeout(2000);
    
    // Simulate payment failure using callback
    const searchParams = new URLSearchParams({
      success: 'false',
      plan: 'PRO',
      pidx: mockResponses.khalti.initiate.pidx
    });
    
    await page.goto(`${BASE_URL}/dashboard/subscription/payment?${searchParams.toString()}`);
    
    // Wait for state update
    await page.waitForTimeout(3000);
    
    // Go back to dashboard to verify user remains FREE
    await page.goto(`${BASE_URL}/dashboard`);
    
    // Verify user remains FREE
    await expect(page.locator('text=FREE').first()).toBeVisible({ timeout: 10000 });
    
    // Verify PRO features are NOT available
    await expect(page.locator('text=AI Settings, text=Advanced Settings')).not.toBeVisible();
    
    console.log('✓ Payment failed and user remains FREE');
  });
});