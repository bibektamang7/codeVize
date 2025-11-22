import { test, expect } from '@playwright/test';

// Define all mocked responses
export const mockResponses = {
  // GitHub API mocks
  github: {
    accessToken: {
      access_token: 'fake-access-token',
      token_type: 'bearer',
      scope: 'user,repo'
    },
    user: {
      id: 123456,
      login: 'testuser',
      email: 'testuser@example.com',
      name: 'Test User'
    },
    repos: [
      {
        id: 1,
        name: 'test-repo-1',
        full_name: 'testuser/test-repo-1',
        private: false,
        html_url: 'https://github.com/testuser/test-repo-1'
      },
      {
        id: 2,
        name: 'test-repo-2',
        full_name: 'testuser/test-repo-2',
        private: false,
        html_url: 'https://github.com/testuser/test-repo-2'
      }
    ]
  },
  
  // Khalti API mocks
  khalti: {
    initiate: {
      pidx: 'test-pidx-12345',
      amount: 10000, // Amount in paisa (10000 paisa = $100)
      expires_at: '2024-12-31 23:59:59'
    },
    lookup: (status: 'Completed' | 'Failed' = 'Completed') => ({
      pidx: 'test-pidx-12345',
      status,
      amount: 10000
    })
  },
  
  // GitHub comments API mock for AI suggestions
  githubComments: {
    id: 'test-comment-id',
    body: 'This is an AI-generated code review suggestion.',
    user: { 
      login: 'codevize-ai',
      id: 999999
    },
    created_at: new Date().toISOString()
  }
};

// Setup function to apply all necessary mocks
export async function setupExternalServiceMocks(page) {
  // Mock GitHub OAuth token endpoint
  await page.route('**://github.com/login/oauth/access_token', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockResponses.github.accessToken)
    });
  });

  // Mock GitHub user endpoint
  await page.route('**://api.github.com/user', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockResponses.github.user)
    });
  });

  // Mock GitHub user repos endpoint
  await page.route('**://api.github.com/user/repos*', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockResponses.github.repos)
    });
  });

  // Mock Khalti payment initiate endpoint
  await page.route('**://api.khalti.com/epayment/initiate/**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockResponses.khalti.initiate)
    });
  });

  // Mock Khalti payment lookup endpoint
  await page.route('**://api.khalti.com/epayment/lookup/**', async route => {
    // Check URL to determine if this should be a success or failure
    const url = route.request().url();
    const shouldFail = url.includes('fail') || url.includes('failed');
    const status = shouldFail ? 'Failed' : 'Completed';
    
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockResponses.khalti.lookup(status))
    });
  });

  // Mock GitHub comments endpoint for AI suggestions
  await page.route('**://api.github.com/repos/*/*/issues/*/comments', async route => {
    // Only mock POST requests (for creating comments)
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(mockResponses.githubComments)
      });
    } else {
      // For GET requests, return empty array
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    }
  });
}