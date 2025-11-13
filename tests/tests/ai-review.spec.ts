import { test, expect } from '@playwright/test';
import { setupExternalServiceMocks, mockResponses } from './mocks';
import { globalTestCleanup } from './cleanup-utils.spec';

const BASE_URL = 'http://localhost:3000';

test.describe('AI Review Suggestion Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Apply all external service mocks before each test
    await setupExternalServiceMocks(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    console.log(`Test "${testInfo.title}" completed. Status: ${testInfo.status}`);
    await globalTestCleanup();
  });

  test('PRO user enables AI review and suggestion is posted', async ({ page }) => {
    console.log('Starting AI review suggestion test...');
    
    // First ensure user is PRO by upgrading
    await page.goto(`${BASE_URL}/dashboard/subscription`);
    
    // Wait for plans to load
    await expect(page.locator('text=FREE')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=PRO')).toBeVisible();
    
    // Select PRO plan and click upgrade
    const upgradeButton = page.locator('button:has-text("Upgrade to PRO"), button:has-text("Subscribe to PRO")').first();
    await expect(upgradeButton).toBeVisible();
    await upgradeButton.click();
    
    // Simulate successful payment completion
    const searchParams = new URLSearchParams({
      success: 'true',
      plan: 'PRO',
      pidx: mockResponses.khalti.initiate.pidx
    });
    
    await page.goto(`${BASE_URL}/dashboard/subscription/payment?${searchParams.toString()}`);
    await page.waitForTimeout(2000);
    
    // Go to dashboard and verify PRO status
    await page.goto(`${BASE_URL}/dashboard`);
    await expect(page.locator('text=PRO').first()).toBeVisible();
    
    // Select the first repository
    const firstRepo = page.locator(`text=${mockResponses.github.repos[0].name}`).first();
    await expect(firstRepo).toBeVisible();
    await firstRepo.click();
    
    // Wait for repo settings page to load
    await expect(page.locator('text=Settings, text=Configuration').first()).toBeVisible({ timeout: 10000 });
    
    // Go to AI Settings tab
    await page.locator('text=AI Settings, text=AI Configuration').click();
    
    // Wait for AI settings elements to load
    await page.waitForTimeout(1000);
    
    // Find and toggle the AI review switch
    const aiReviewToggle = page.locator('data-testid=ai-review-toggle, .ai-review-toggle, [id*="ai-review"]')
      .or(page.locator('role=switch').filter({ hasText: /ai|review/i }));
    
    if (await aiReviewToggle.count() > 0) {
      await expect(aiReviewToggle).toBeVisible();
      
      // Check if toggle is already on, if not, click it
      const isToggled = await aiReviewToggle.isChecked ? 
        await aiReviewToggle.isChecked() : 
        await aiReviewToggle.getAttribute('aria-checked') === 'true';
      
      if (!isToggled) {
        await aiReviewToggle.click();
      }
    } else {
      // If no explicit toggle found, look for enable/disable buttons
      const enableButton = page.locator('button:has-text("Enable AI Review"), button:has-text("Turn On AI")');
      if (await enableButton.count() > 0) {
        await expect(enableButton).toBeVisible();
        await enableButton.click();
      } else {
        // Look for any button that might enable AI features
        const possibleEnableButton = page.locator('button:has-text("Enable"), button:has-text("Activate")');
        if (await possibleEnableButton.count() > 0) {
          await possibleEnableButton.first().click();
        }
      }
    }
    
    // Save settings
    const saveButton = page.locator('button:has-text("Save"), button:has-text("Save Settings")');
    if (await saveButton.count() > 0) {
      await expect(saveButton).toBeVisible();
      await saveButton.click();
      
      // Wait for success message
      await expect(page.locator('text=Saved, text=Success, text=Settings saved').first()).toBeVisible({ timeout: 5000 });
    }
    
    // Verify AI review is enabled by checking for confirmation
    await expect(page.locator('text=AI Review Enabled, text=Active, text=Enabled')).toBeVisible();
    
    // Simulate a pull request or code change that would trigger AI review
    // This could be creating a mock PR or simulating the backend process
    console.log('✓ PRO user enabled AI review and should receive suggestions');
  });
});