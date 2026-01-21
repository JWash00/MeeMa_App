import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration for visual regression testing of Storybook stories.
 *
 * Usage:
 * 1. Start Storybook: npm run storybook
 * 2. Run tests: npm run test:visual
 * 3. Update snapshots: npm run test:visual:update
 */
export default defineConfig({
  testDir: './tests/visual',

  // Timeout for each test
  timeout: 30000,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Reporter to use
  reporter: [
    ['html'],
    ['list'],
  ],

  // Shared settings for all projects
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.STORYBOOK_URL || 'http://localhost:6006',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Force dark color scheme for consistency
        colorScheme: 'dark',
      },
    },
  ],

  // Run your local dev server before starting the tests
  // Uncomment if you want Playwright to start Storybook automatically
  // webServer: {
  //   command: 'npm run storybook',
  //   url: 'http://localhost:6006',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120000,
  // },
})
