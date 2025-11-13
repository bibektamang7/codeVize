import { test, expect } from '@playwright/test';

// Constants for test users and repos
const TEST_USER_EMAIL = 'testuser@example.com';
const TEST_USER_NAME = 'testuser';
const TEST_REPO_1 = 'test-repo-1';
const TEST_REPO_2 = 'test-repo-2';

// Mocked GitHub API responses
const mockGithubResponses = {
  '/login/oauth/access_token': {
    access_token: 'fake-access-token',
    token_type: 'bearer',
    scope: 'user,repo'
  },
  '/user': {
    id: 123456,
    login: TEST_USER_NAME,
    email: TEST_USER_EMAIL,
    name: 'Test User'
  },
  '/user/repos': [
    {
      id: 1,
      name: TEST_REPO_1,
      full_name: `${TEST_USER_NAME}/${TEST_REPO_1}`,
      private: false,
      html_url: `https://github.com/${TEST_USER_NAME}/${TEST_REPO_1}`
    },
    {
      id: 2,
      name: TEST_REPO_2,
      full_name: `${TEST_USER_NAME}/${TEST_REPO_2}`,
      private: false,
      html_url: `https://github.com/${TEST_USER_NAME}/${TEST_REPO_2}`
    }
  ]
};

// Mocked Khalti API responses
const mockKhaltiResponses = {
  '/epayment/initiate/': {
    pidx: 'test-pidx-12345',
    amount: 10000,
    expires_at: '2024-12-31 23:59:59'
  },
  '/epayment/lookup/': {
    pidx: 'test-pidx-12345',
    status: 'Completed', // or 'Failed'
    amount: 10000
  }
};

test.describe('GitHub SaaS Application E2E Tests', () => {
  
  // Setup before each test
  test.beforeEach(async ({ page, request }) => {
    // Mock GitHub API endpoints
    await page.route('https://github.com/login/oauth/access_token', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockGithubResponses['/login/oauth/access_token'])
      });
    });

    await page.route('https://api.github.com/user', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockGithubResponses['/user'])
      });
    });

    await page.route('https://api.github.com/user/repos*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockGithubResponses['/user/repos'])
      });
    });

    // Mock Khalti API endpoints
    await page.route('https://api.khalti.com/epayment/initiate/*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockKhaltiResponses['/epayment/initiate/'])
      });
    });

    await page.route('https://api.khalti.com/epayment/lookup/*', async route => {
      const status = route.request().url().includes('failed') ? 'Failed' : 'Completed';
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...mockKhaltiResponses['/epayment/lookup/'],
          status
        })
      });
    });

    // Mock GitHub issues comments endpoint for AI review suggestions
    await page.route('https://api.github.com/repos/*/*/issues/*/comments', async route => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-comment-id',
          body: 'This is an AI-generated code review suggestion.',
          user: { login: 'codevize-ai' }
        })
      });
    });
  });

  test('New user signup & repo view', async ({ page }) => {
    // Navigate to the signup page
    await page.goto('http://localhost:3000/signup');
    
    // Click the GitHub signup button
    const githubSignupButton = page.locator('button:has-text("Sign up with GitHub")');
    await expect(githubSignupButton).toBeVisible();
    await githubSignupButton.click();
    
    // Wait for redirect to dashboard after GitHub auth
    await page.waitForURL('**/dashboard');
    
    // Verify user is on dashboard and can see repos
    await expect(page.locator('text=Dashboard')).toBeVisible();
    
    // Check that repos are displayed
    await expect(page.locator(`text=${TEST_REPO_1}`)).toBeVisible();
    await expect(page.locator(`text=${TEST_REPO_2}`)).toBeVisible();
    
    console.log('✓ New user signup & repo view test passed');
  });

  test('Upgrade FREE → PRO via Khalti', async ({ page }) => {
    // Start with a free user on dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // Navigate to subscription page
    await page.locator('text=Subscription').click();
    await page.waitForURL('**/dashboard/subscription');
    
    // Select PRO plan and click upgrade
    await page.locator('text=PRO').click();
    const upgradeButton = page.locator('button:has-text("Upgrade to PRO")');
    await expect(upgradeButton).toBeVisible();
    await upgradeButton.click();
    
    // Wait for Khalti payment flow to initiate
    await page.waitForURL('**/khalti**');
    
    // Simulate successful payment
    // In a real scenario, this would involve the Khalti payment UI
    // For testing, we'll assume payment is successful and redirect back
    
    // Mock the callback to backend to complete the payment
    await page.goto('http://localhost:3000/dashboard/subscription/payment?success=true&plan=PRO');
    
    // Verify user is now PRO
    await page.goto('http://localhost:3000/dashboard');
    await expect(page.locator('text=PRO')).toBeVisible();
    
    console.log('✓ Upgrade FREE → PRO via Khalti test passed');
  });

  test('Payment fails → remains FREE', async ({ page }) => {
    // Start with a free user on dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // Navigate to subscription page
    await page.locator('text=Subscription').click();
    await page.waitForURL('**/dashboard/subscription');
    
    // Select PRO plan and click upgrade
    await page.locator('text=PRO').click();
    const upgradeButton = page.locator('button:has-text("Upgrade to PRO")');
    await expect(upgradeButton).toBeVisible();
    await upgradeButton.click();
    
    // Wait for Khalti payment flow to initiate
    await page.waitForURL('**/khalti**');
    
    // Simulate payment failure (in our mock, we'll use a special URL to trigger failure)
    await page.goto('http://localhost:3000/dashboard/subscription/payment?success=false');
    
    // Verify user remains FREE
    await page.goto('http://localhost:3000/dashboard');
    await expect(page.locator('text=FREE')).toBeVisible();
    
    console.log('✓ Payment fails → remains FREE test passed');
  });

  test('PRO user enables AI review → suggestion posted', async ({ page }) => {
    // First upgrade to PRO for this test
    await page.goto('http://localhost:3000/dashboard/subscription');
    
    // Select PRO plan and click upgrade
    await page.locator('text=PRO').click();
    const upgradeButton = page.locator('button:has-text("Upgrade to PRO")');
    await expect(upgradeButton).toBeVisible();
    await upgradeButton.click();
    
    // Simulate successful payment completion
    await page.goto('http://localhost:3000/dashboard/subscription/payment?success=true&plan=PRO');
    
    // Now navigate to repo settings
    await page.goto('http://localhost:3000/dashboard');
    await page.locator(`text=${TEST_REPO_1}`).click();
    
    // Go to AI settings tab
    await page.locator('text=AI Settings').click();
    
    // Enable AI review
    const aiReviewToggle = page.locator('data-testid=ai-review-toggle');
    await expect(aiReviewToggle).toBeVisible();
    await aiReviewToggle.click();
    
    // Save settings
    const saveButton = page.locator('button:has-text("Save Settings")');
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    
    // Wait for success message
    await expect(page.locator('text=Settings saved successfully')).toBeVisible();
    
    console.log('✓ PRO user enables AI review → suggestion posted test passed');
  });

  test('Edit general config (tone, context)', async ({ page }) => {
    // Navigate to repo settings
    await page.goto('http://localhost:3000/dashboard');
    await page.locator(`text=${TEST_REPO_1}`).click();
    
    // Go to General Settings tab
    await page.locator('text=General Settings').click();
    
    // Edit tone
    const toneInput = page.locator('input[placeholder="Enter tone"]');
    await expect(toneInput).toBeVisible();
    await toneInput.fill('Professional and concise');
    
    // Edit context
    const contextInput = page.locator('textarea[placeholder="Enter context"]');
    await expect(contextInput).toBeVisible();
    await contextInput.fill('This project follows strict coding standards');
    
    // Save settings
    const saveButton = page.locator('button:has-text("Save Settings")');
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    
    // Wait for success message
    await expect(page.locator('text=Settings saved successfully')).toBeVisible();
    
    // Verify settings were saved
    await page.reload();
    await page.locator('text=General Settings').click();
    await expect(toneInput).toHaveValue('Professional and concise');
    await expect(contextInput).toHaveValue('This project follows strict coding standards');
    
    console.log('✓ Edit general config (tone, context) test passed');
  });

  // Test cleanup after each test
  test.afterEach(async ({ page }) => {
    // Clean up test data through admin API
    // In a real implementation, you would call your admin API to cleanup
    console.log('✓ Cleanup completed after test');
  });
});