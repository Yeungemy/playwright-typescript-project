import path from 'node:path';
import { test as base } from '@playwright/test';
import { AGED_FAILURE_DASHBOARD_TITLE } from '../reporting/agedFailuresDashboard';
import { createFailureDetails } from '../reporting/failureDetails';
import {
    readFailureHistory,
    type FailureHistory,
    type FailureObservation,
} from '../reporting/failureHistory';

type FailureReportingFixture = {
    failureReporting: void;
};

type FailureReportingWorkerFixture = {
    failureRunState: {
        history: FailureHistory;
    };
};

export const test = base.extend<
    FailureReportingFixture,
    FailureReportingWorkerFixture
>({
    failureRunState: [
        async ({}, use) => {
            const historyFile = path.resolve(
                process.env.PLAYWRIGHT_FAILURE_HISTORY_PATH ??
                    '.playwright/failure-history.json'
            );

            await use({
                history: await readFailureHistory(historyFile),
            });
        },
        { scope: 'worker' },
    ],
    failureReporting: [
        async ({ failureRunState }, use, testInfo) => {
            await use();

            if (testInfo.retry < testInfo.project.retries) {
                return;
            }

            const now = new Date();
            const file = path.relative(process.cwd(), testInfo.file);
            const location = `${file}:${testInfo.line}:${testInfo.column}`;
            let status: FailureObservation['status'];
            if (
                (testInfo.status === 'failed' ||
                    testInfo.status === 'timedOut') &&
                testInfo.status !== testInfo.expectedStatus
            ) {
                status = 'failed';
            } else if (testInfo.status === 'skipped') {
                status = 'skipped';
            } else if (
                testInfo.status === 'passed' ||
                testInfo.status === testInfo.expectedStatus
            ) {
                status = testInfo.retry > 0 ? 'flaky' : 'passed';
            } else {
                return;
            }

            const observation: FailureObservation = {
                id: testInfo.testId,
                title: testInfo.title,
                project: testInfo.project.name || 'default',
                file,
                location,
                status,
            };

            if (
                status !== 'failed' ||
                testInfo.status === testInfo.expectedStatus
            ) {
                return;
            }

            const details = createFailureDetails(
                testInfo.title,
                location,
                observation.project,
                failureRunState.history.tests[testInfo.testId],
                now
            );

            testInfo.annotations.push({
                type: 'failure-history',
                description: details,
            });
            await testInfo.attach('failure-history', {
                body: Buffer.from(details),
                contentType: 'text/plain',
            });
            await testInfo.attach('Aged failed cases dashboard', {
                body: Buffer.from(
                    `${AGED_FAILURE_DASHBOARD_TITLE}\n\n` +
                        'Dashboard content is finalized after the test run.\n'
                ),
                contentType: 'text/markdown',
            });
        },
        { auto: true },
    ],
});
