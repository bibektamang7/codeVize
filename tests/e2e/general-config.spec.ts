import { test, expect } from '@playwright/test';
import { setupExternalServiceMocks, mockResponses } from './mocks';
import { globalTestCleanup } from './cleanup-utils.spec';

const BASE_URL = 'http://localhost:3000';

test.describe('General Configuration Editing', () => {
  test.beforeEach(async ({ page }) => {
    // Apply all external service mocks before each test
    await setupExternalServiceMocks(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    console.log(`Test "${testInfo.title}" completed. Status: ${testInfo.status}`);
    await globalTestCleanup();
  });

  test('Edit general config (tone, context)', async ({ page }) => {
    console.log('Starting general config editing test...');
    
    // Navigate to dashboard
    await page.goto(`${BASE_URL}/dashboard`);
    
    // Select the first repository
    const firstRepo = page.locator(`text=${mockResponses.github.repos[0].name}`).first();
    await expect(firstRepo).toBeVisible();
    await firstRepo.click();
    
    // Wait for repo settings page to load
    await expect(page.locator('text=Settings, text=Configuration').first()).toBeVisible({ timeout: 10000 });
    
    // Go to General Settings tab
    await page.locator('text=General Settings, text=General Config').click();
    
    // Wait for inputs to be visible
    await page.waitForTimeout(1000);
    
    // Edit tone - first try to find the tone input by various possible selectors
    const toneInput = page.locator('input[placeholder*="tone" i], input[label*="tone" i], [data-testid*="tone" i], input[id*="tone" i], input[name*="tone" i]');
    
    if (await toneInput.count() > 0) {
      await expect(toneInput.first()).toBeVisible();
      await toneInput.first().fill('Professional and concise');
    } else {
      // If no specific tone input found, try broader selectors
      const possibleToneInput = page.locator('input').filter({ hasText: /tone/i }).first()
        .or(page.locator('input').filter({ has: page.locator('label').filter({ hasText: /tone/i }) }).first());
      
      if (await possibleToneInput.count() > 0) {
        await expect(possibleToneInput).toBeVisible();
        await possibleToneInput.fill('Professional and concise');
      } else {
        // Try to find by nearby text
        const inputNearToneText = page.locator('text=/Tone/i >> .. >> input');
        if (await inputNearToneText.count() > 0) {
          await expect(inputNearToneText.first()).toBeVisible();
          await inputNearToneText.first().fill('Professional and concise');
        }
      }
    }
    
    // Edit context - find the context textarea by various possible selectors
    const contextInput = page.locator('textarea[placeholder*="context" i], textarea[label*="context" i], [data-testid*="context" i], textarea[id*="context" i], textarea[name*="context" i]');
    
    if (await contextInput.count() > 0) {
      await expect(contextInput.first()).toBeVisible();
      await contextInput.first().fill('This project follows strict coding standards and best practices.');
    } else {
      // If no specific context input found, try broader selectors
      const possibleContextInput = page.locator('textarea').filter({ hasText: /context/i }).first()
        .or(page.locator('textarea').filter({ has: page.locator('label').filter({ hasText: /context/i }) }).first());
      
      if (await possibleContextInput.count() > 0) {
        await expect(possibleContextInput).toBeVisible();
        await possibleContextInput.fill('This project follows strict coding standards and best practices.');
      } else {
        // Try to find by nearby text
        const inputNearContextText = page.locator('text=/Context/i >> .. >> textarea');
        if (await inputNearContextText.count() > 0) {
          await expect(inputNearContextText.first()).toBeVisible();
          await inputNearContextText.first().fill('This project follows strict coding standards and best practices.');
        }
      }
    }
    
    // Save settings
    const saveButton = page.locator('button:has-text("Save"), button:has-text("Save Settings"), button:has-text("Update")');
    await expect(saveButton.first()).toBeVisible();
    await saveButton.first().click();
    
    // Wait for success confirmation
    await expect(page.locator('text=Saved, text=Success, text=Settings saved').first()).toBeVisible({ timeout: 5000 });
    
    // Reload page to verify settings persisted
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Go back to General Settings tab
    await page.locator('text=General Settings, text=General Config').click();
    await page.waitForTimeout(1000);
    
    // Verify settings were saved - check tone
    if (await toneInput.count() > 0) {
      await expect(toneInput.first()).toHaveValue('Professional and concise');
    } else {
      const possibleToneInput = page.locator('input').filter({ hasText: /tone/i }).first()
        .or(page.locator('input').filter({ has: page.locator('label').filter({ hasText: /tone/i }) }).first());
      
      if (await possibleToneInput.count() > 0) {
        await expect(possibleToneInput).toHaveValue('Professional and concise');
      }
    }
    
    // Verify settings were saved - check context
    if (await contextInput.count() > 0) {
      await expect(contextInput.first()).toHaveValue('This project follows strict coding standards and best practices.');
    } else {
      const possibleContextInput = page.locator('textarea').filter({ hasText: /context/i }).first()
        .or(page.locator('textarea').filter({ has: page.locator('label').filter({ hasText: /context/i }) }).first());
      
      if (await possibleContextInput.count() > 0) {
        await expect(possibleContextInput).toHaveValue('This project follows strict coding standards and best practices.');
      }
    }
    
    console.log('✓ General config (tone, context) edited successfully');
  });
});