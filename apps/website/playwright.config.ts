import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.test.ts',

  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  timeout: 10 * 1000,
  expect: { timeout: 5 * 1000 },

  reporter: process.env.CI
    ? [['dot'], ['github']]
    : [['list'], ['html', { outputFolder: './node_modules/.cache/playwright/report' }]],
  outputDir: './node_modules/.cache/playwright/output',

  use: {
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',

    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'on-first-retry',

    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL ?? 'http://127.0.0.1:4001',
  },

  projects: [
    { name: 'Desktop Chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'Desktop Firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'Desktop Safari', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 13'] } },
  ],
});
