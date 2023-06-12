import { env } from 'node:process';
import { defineConfig, devices } from '@playwright/test';

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.test.ts',

  fullyParallel: true,
  forbidOnly: Boolean(env.CI),
  retries: env.CI ? 2 : 0,
  workers: env.CI ? 1 : undefined,

  timeout: 10 * 1000,
  expect: { timeout: 5 * 1000 },

  reporter: process.env.CI
    ? [['dot'], ['github']]
    : [
        ['list'],
        ['html', { outputFolder: './node_modules/.cache/playwright/report' }],
      ],
  outputDir: './node_modules/.cache/playwright/output',

  use: {
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',

    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'on-first-retry',

    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL ?? 'http://127.0.0.1:5000',
    extraHTTPHeaders: {
      'x-vercel-set-bypass-cookie': 'true',
      'x-vercel-protection-bypass':
        process.env.VERCEL_PROTECTION_BYPASS_TOKEN ?? '',
    },
  },

  projects: [
    { name: 'Desktop Chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'Desktop Firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'Desktop Safari', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 13'] } },
  ],

  webServer: process.env.CI
    ? undefined
    : {
        command:
          'doppler run -- pnpm run build --mode=ci --logLevel=silent 1>/dev/null 2>&1 && pnpm exec vite preview --logLevel=error',
        port: 5000,
      },
});
