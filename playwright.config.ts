import { defineConfig, devices } from '@playwright/test';
import os from 'os';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const testReportPath = 'dist/test-report';

// Ensure the folder exists
if (!fs.existsSync(testReportPath)) {
  fs.mkdirSync(testReportPath, { recursive: true });
}

export default defineConfig({
  testDir: './src',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    // ['line'],
    // ['html', { outputFolder: `${testReportPath}/html-report` }],
    [
      'allure-playwright',
      {
        resultsDir: `${testReportPath}/allure-results`,
        detail: true,
        suiteTitle: true,
        environmentInfo: {
          os_platform: os.platform(),
          os_release: os.release(),
          os_version: (os as any).version?.() || 'N/A',
          node_version: process.version,
        },
      },
    ],
  ],

  use: {
    baseURL: process.env.BASE_URL,
    // headless: false, 
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
    testIdAttribute: 'data-testid',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  globalSetup: require.resolve('./src/global/global-setup.ts'),

  // Output folder for screenshots, videos, traces, etc.
  outputDir: `${testReportPath}/test-artifacts`,
});
