import { defineConfig, devices } from '@playwright/test';
import os from 'os';
import { environment } from './src/config/environment';

const testReportPath =
    process.env.PLAYWRIGHT_REPORT_DIRECTORY ?? 'dist/test-report';
const allureResultsPath = `${testReportPath}/allure-results`;

export default defineConfig({
    globalSetup: './src/config/global-setup.ts',
    testDir: './src/tests',
    testMatch: '**/*.spec.ts',

    fullyParallel: true,
    forbidOnly: environment.isCi,
    retries: environment.isCi ? 2 : 0,
    workers: environment.workers ?? (environment.isCi ? 1 : undefined),
    expect: {
        timeout: environment.defaultTimeout,
    },

    reporter: [
        ['list'],
        ['./src/reporting/failureHistoryReporter.ts'],
        [
            'html',
            {
                outputFolder: `${testReportPath}/html-report`,
                open: 'never',
            },
        ],
        [
            'allure-playwright',
            {
                resultsDir: allureResultsPath,
                detail: true,
                suiteTitle: true,
                environmentInfo: {
                    os_platform: os.platform(),
                    os_release: os.release(),
                    os_version: os.version(),
                    node_version: process.version,
                },
            },
        ],
    ],

    use: {
        baseURL: environment.baseUrl,
        headless: environment.headless,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        actionTimeout: environment.actionTimeout,
        navigationTimeout: environment.navigationTimeout,
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

    outputDir: `${testReportPath}/test-artifacts`,
});
