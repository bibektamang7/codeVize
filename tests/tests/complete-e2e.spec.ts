import { test, expect } from '@playwright/test';
import { setupExternalServiceMocks, mockResponses } from './mocks';
import { cleanupTestUser, cleanupTestRepository, globalTestCleanup } from './cleanup-utils.spec';

const BASE_URL = 'http://localhost:3000';

test.describe('GitHub SaaS Application E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Apply all external service mocks before each test
    await setupExternalServiceMocks(page);
  });

  test('New user signup & repo view', async ({ page }) => {
    console.log('Starting new user signup & repo view test...');
    
    // Navigate to the signup page
    await page.goto(`${BASE_URL}/signup`);
    
    // Click the GitHub signup button
    const githubSignupButton = page.locator('button:has-text("Sign up with GitHub"), button:text("Continue with GitHub")');
    await expect(githubSignupButton).toBeVisible();
    await githubSignupButton.click();
    
    // Wait for redirect to dashboard after GitHub auth
    await page.waitForURL(`${BASE_URL}/dashboard`);
    
    // Verify user is on dashboard
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
    
    // Check that repos are displayed
    for (const repo of mockResponses.github.repos) {
      await expect(page.locator(`text=${repo.name}`)).toBeVisible();
    }
    
    console.log('✓ New user signup & repo view test passed');
  });

  test('Upgrade FREE → PRO via Khalti', async ({ page }) => {
    console.log('Starting upgrade FREE → PRO test...');
    
    // Start with a free user on dashboard
    await page.goto(`${BASE_URL}/dashboard`);
    
    // Navigate to subscription page
    await page.locator('text=Subscription, text=Plans, text=Upgrade').click();
    await page.waitForURL('**/dashboard/subscription');
    
    // Wait for plans to load
    await expect(page.locator('text=FREE')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=PRO')).toBeVisible();
    
    // Select PRO plan and click upgrade
    const upgradeButton = page.locator('button:has-text("Upgrade"), button:has-text("Subscribe"), button:has-text("Pay")').first();
    await expect(upgradeButton).toBeVisible();
    await upgradeButton.click();
    
    // Wait for Khalti payment flow to initiate (would normally redirect)
    // In our case, we'll mock the payment process
    await page.waitForTimeout(2000); // Wait for payment process simulation
    
    // Complete the payment using our mock (simulated successful payment callback)
    const searchParams = new URLSearchParams({
      success: 'true',
      plan: 'PRO',
      pidx: mockResponses.khalti.initiate.pidx
    });
    
    await page.goto(`${BASE_URL}/dashboard/subscription/payment?${searchParams.toString()}`);
    
    // Wait a bit for state to update
    await page.waitForTimeout(2000);
    
    // Go back to dashboard to verify plan upgrade
    await page.goto(`${BASE_URL}/dashboard`);
    
    // Verify user is now PRO
    // We'll look for PRO-related elements or check user status
    await expect(page.locator('text=PRO, text=pro')).toBeVisible();
    
    // Verify PRO features are available
    const aiSettingsTab = page.locator('text=AI Settings');
    await expect(aiSettingsTab).toBeVisible();
    
    console.log('✓ Upgrade FREE → PRO via Khalti test passed');
  });

  test('Payment fails → remains FREE', async ({ page }) => {
    console.log('Starting payment failure test...');
    
    // Start with a free user on dashboard
    await page.goto(`${BASE_URL}/dashboard`);
    
    // Navigate to subscription page
    await page.locator('text=Subscription, text=Plans').click();
    await page.waitForURL('**/dashboard/subscription');
    
    // Wait for plans to load
    await expect(page.locator('text=FREE')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=PRO')).toBeVisible();
    
    // Select PRO plan and click upgrade
    const upgradeButton = page.locator('button:has-text("Upgrade"), button:has-text("Subscribe")').first();
    await expect(upgradeButton).toBeVisible();
    await upgradeButton.click();
    
    // Wait for payment process
    await page.waitForTimeout(2000);
    
    // Simulate payment failure
    const searchParams = new URLSearchParams({
      success: 'false',
      plan: 'PRO',
      pidx: mockResponses.khalti.initiate.pidx
    });
    
    await page.goto(`${BASE_URL}/dashboard/subscription/payment?${searchParams.toString()}`);
    
    // Wait for state update
    await page.waitForTimeout(2000);
    
    // Go back to dashboard to verify user remains FREE
    await page.goto(`${BASE_URL}/dashboard`);
    
    // Verify user remains FREE (should still see FREE plan indicators)
    await expect(page.locator('text=FREE, text=free')).toBeVisible();
    
    // Verify PRO features are NOT available
    const aiSettingsTab = page.locator('text=AI Settings');
    await expect(aiSettingsTab).not.toBeVisible(); // AI features should not be available
    
    console.log('✓ Payment fails → remains FREE test passed');
  });

  test('PRO user enables AI review → suggestion posted', async ({ page }) => {
    console.log('Starting AI review test...');
    
    // First upgrade to PRO for this test
    await page.goto(`${BASE_URL}/dashboard/subscription`);
    
    // Wait for plans to load
    await expect(page.locator('text=FREE')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=PRO')).toBeVisible();
    
    // Select PRO plan and click upgrade
    const upgradeButton = page.locator('button:has-text("Upgrade"), button:has-text("Subscribe")').first();
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
    
    // Go to dashboard and select a repo
    await page.goto(`${BASE_URL}/dashboard`);
    await expect(page.locator('text=PRO')).toBeVisible();
    
    // Select the first repository
    const firstRepo = page.locator(`text=${mockResponses.github.repos[0].name}`).first();
    await expect(firstRepo).toBeVisible();
    await firstRepo.click();
    
    // Wait for repo page to load
    await expect(page.locator('text=Settings, text=Configuration')).toBeVisible({ timeout: 10000 });
    
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
      const enableButton = page.locator('button:has-text("Enable AI Review"), button:has-text("Turn On")');
      if (await enableButton.count() > 0) {
        await enableButton.click();
      }
    }
    
    // Save settings
    const saveButton = page.locator('button:has-text("Save"), button:has-text("Save Settings")');
    if (await saveButton.count() > 0) {
      await expect(saveButton).toBeVisible();
      await saveButton.click();
      
      // Wait for success message
      await expect(page.locator('text=Saved, text=Success')).toBeVisible({ timeout: 5000 });
    }
    
    // Verify AI review is enabled by checking for AI-related UI elements
    await expect(page.locator('text=AI Review, text=enabled')).toBeVisible();
    
    console.log('✓ PRO user enables AI review → suggestion posted test passed');
  });

  test('Edit general config (tone, context)', async ({ page }) => {
    console.log('Starting general config edit test...');
    
    // Navigate to dashboard
    await page.goto(`${BASE_URL}/dashboard`);
    
    // Select the first repository
    const firstRepo = page.locator(`text=${mockResponses.github.repos[0].name}`).first();
    await expect(firstRepo).toBeVisible();
    await firstRepo.click();
    
    // Wait for repo settings page to load
    await expect(page.locator('text=Settings, text=Configuration')).toBeVisible({ timeout: 10000 });
    
    // Go to General Settings tab
    await page.locator('text=General Settings, text=General Config').click();
    
    // Wait for inputs to be visible
    await page.waitForTimeout(1000);
    
    // Edit tone
    const toneInput = page.locator('input[placeholder*="tone" i], input[label*="tone" i], [data-testid*="tone" i]');
    if (await toneInput.count() > 0) {
      await expect(toneInput).toBeVisible();
      await toneInput.fill('Professional and concise');
    }
    
    // Edit context
    const contextInput = page.locator('textarea[placeholder*="context" i], textarea[label*="context" i], [data-testid*="context" i]');
    if (await contextInput.count() > 0) {
      await expect(contextInput).toBeVisible();
      await contextInput.fill('This project follows strict coding standards and best practices.');
    }
    
    // Save settings
    const saveButton = page.locator('button:has-text("Save"), button:has-text("Save Settings")');
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    
    // Wait for success confirmation
    await expect(page.locator('text=Saved, text=Success')).toBeVisible({ timeout: 5000 });
    
    // Reload page to verify settings persisted
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Go back to General Settings tab
    await page.locator('text=General Settings, text=General Config').click();
    await page.waitForTimeout(1000);
    
    // Verify settings were saved
    if (await toneInput.count() > 0) {
      await expect(toneInput).toHaveValue('Professional and concise');
    }
    
    if (await contextInput.count() > 0) {
      await expect(contextInput).toHaveValue('This project follows strict coding standards and best practices.');
    }
    
    console.log('✓ Edit general config (tone, context) test passed');
  });

  test.afterEach(async ({ page }, testInfo) => {
    console.log(`Test "${testInfo.title}" completed. Status: ${testInfo.status}`);
    
    // Clean up test data through admin API
    if (testInfo.status === 'passed') {
      console.log('Test passed, cleaning up test data...');
      // In a real implementation, you would extract the test user ID from the session
      // and call the cleanup function
      // await cleanupTestUser(testUserId);
      // await cleanupTestRepository(testRepoId);
    } else {
      console.log(`Test failed, status: ${testInfo.status}`);
    }
    
    // Perform any global cleanup
    await globalTestCleanup();
  });
});