import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { expect, test } from '../../fixtures';
import {
    AGED_FAILURE_THRESHOLD_DAYS,
    AGED_FAILURE_DASHBOARD_TITLE,
    renderAgedFailuresDashboard,
    toAgedFailureDashboardItems,
} from '../../reporting/agedFailuresDashboard';
import { createFailureDetails } from '../../reporting/failureDetails';
import {
    updateAllureDashboardAttachments,
    updateHtmlDashboardAttachments,
} from '../../reporting/dashboardAttachments';
import {
    updateFailureHistory,
    type FailureHistory,
    type FailureObservation,
} from '../../reporting/failureHistory';

test('failure streak resets on pass and starts at one on the next failure', () => {
    const observation: FailureObservation = {
        id: 'api-token-test',
        title: '@api @smoke retrieves an OAuth access token',
        project: 'chromium',
        file: 'src/tests/api/specs/token.spec.ts',
        status: 'failed',
    };
    let history: FailureHistory = {
        version: 1,
        updatedAt: '2026-01-01T00:00:00.000Z',
        tests: {},
    };

    for (const [index, day] of [1, 2, 3].entries()) {
        history = updateFailureHistory(
            history,
            [observation],
            new Date(`2026-01-0${day}T00:00:00.000Z`)
        );
        expect(history.tests['api-token-test'].observedFailureRuns).toBe(
            index + 1
        );
    }

    history = updateFailureHistory(
        history,
        [{ ...observation, status: 'passed' }],
        new Date('2026-01-04T00:00:00.000Z')
    );
    expect(history.tests['api-token-test']).toBeUndefined();

    history = updateFailureHistory(
        history,
        [observation],
        new Date('2026-01-05T00:00:00.000Z')
    );
    expect(history.tests['api-token-test'].observedFailureRuns).toBe(1);
});

test('failure details show case, location, elapsed age, and failure streak', () => {
    const details = createFailureDetails(
        '@api @smoke retrieves an OAuth access token',
        'src/tests/api/specs/token.spec.ts:12:5',
        'chromium',
        {
            id: 'api-token-test',
            title: '@api @smoke retrieves an OAuth access token',
            project: 'chromium',
            file: 'src/tests/api/specs/token.spec.ts',
            firstFailedAt: '2026-10-23T12:00:00.000Z',
            lastFailedAt: '2026-10-25T12:00:00.000Z',
            observedFailureRuns: 2,
        },
        new Date('2026-10-26T12:00:00.000Z')
    );

    expect(details).toContain(
        'Test case: @api @smoke retrieves an OAuth access token'
    );
    expect(details).toContain(
        'Location: src/tests/api/specs/token.spec.ts:12:5'
    );
    expect(details).toContain('Age: 3 day(s)');
    expect(details).toContain('Consecutive failed runs: 3');
});

test('aged failure dashboard summarizes and sorts current failed cases', () => {
    const now = new Date('2026-10-27T12:00:00.000Z');
    const failures = toAgedFailureDashboardItems(
        [
            {
                id: 'recent',
                title: 'Recent failure',
                project: 'chromium',
                file: 'src/tests/api/recent.spec.ts',
                location: 'src/tests/api/recent.spec.ts:8:3',
                firstFailedAt: '2026-10-25T12:00:00.000Z',
                lastFailedAt: '2026-10-27T12:00:00.000Z',
                observedFailureRuns: 2,
            },
            {
                id: 'aged',
                title: 'Aged | failure',
                project: 'firefox',
                file: 'src/tests/ui/aged.spec.ts',
                location: 'src/tests/ui/aged.spec.ts:14:5',
                firstFailedAt: '2026-09-27T12:00:00.000Z',
                lastFailedAt: '2026-10-27T12:00:00.000Z',
                observedFailureRuns: 4,
            },
        ],
        now
    );

    const dashboard = renderAgedFailuresDashboard(failures, now);

    expect(dashboard).toContain(
        `Aged failures (>= ${AGED_FAILURE_THRESHOLD_DAYS} days): 1`
    );
    expect(dashboard).toContain(
        '| Test case | Location | Project | Age (days) | Consecutive failed runs | Aged |'
    );
    expect(dashboard.indexOf('Aged \\| failure')).toBeLessThan(
        dashboard.indexOf('Recent failure')
    );
    expect(dashboard).toContain('src/tests/ui/aged.spec.ts:14:5');
    expect(dashboard).toContain(
        '| Aged \\| failure | src/tests/ui/aged.spec.ts:14:5 | firefox | 30 | 4 | Yes |'
    );
});

test('aged failure dashboard handles runs with no failures', () => {
    const dashboard = renderAgedFailuresDashboard(
        [],
        new Date('2026-10-27T12:00:00.000Z')
    );

    expect(dashboard).toContain('Current failed cases: 0');
    expect(dashboard).toContain(
        `Aged failures (>= ${AGED_FAILURE_THRESHOLD_DAYS} days): 0`
    );
    expect(dashboard).toContain('No failed cases in this run.');
});

test('finalizes the dashboard attachment in HTML and Allure results', async () => {
    const reportDirectory = await mkdtemp(
        path.join(os.tmpdir(), 'playwright-report-')
    );
    const allureResultsDirectory = path.join(reportDirectory, 'allure-results');
    const initialDashboard = `${AGED_FAILURE_DASHBOARD_TITLE}\n\nDashboard is pending.\n`;
    const finalDashboard = `${AGED_FAILURE_DASHBOARD_TITLE}\n\nCurrent failed cases: 2\n`;
    const finalDashboardPath = path.join(
        reportDirectory,
        'aged-failures-dashboard.md'
    );
    const htmlAttachment: {
        name: string;
        contentType: string;
        body?: Buffer;
        path?: string;
    } = {
        name: 'Aged failed cases dashboard',
        contentType: 'text/markdown',
        body: Buffer.from(initialDashboard),
    };
    const htmlTests = [{ results: [{ attachments: [htmlAttachment] }] }];
    const allureAttachmentSource = 'allure-attachment';
    const allureResultPath = path.join(
        allureResultsDirectory,
        'sample-result.json'
    );

    try {
        await mkdir(allureResultsDirectory, { recursive: true });
        await Promise.all([
            writeFile(finalDashboardPath, initialDashboard),
            writeFile(
                path.join(allureResultsDirectory, allureAttachmentSource),
                initialDashboard
            ),
            writeFile(
                allureResultPath,
                JSON.stringify({
                    steps: [
                        {
                            attachments: [
                                {
                                    name: 'Aged failed cases dashboard',
                                    source: allureAttachmentSource,
                                },
                            ],
                        },
                    ],
                })
            ),
        ]);

        await writeFile(finalDashboardPath, finalDashboard);
        updateHtmlDashboardAttachments(htmlTests, finalDashboardPath);
        await updateAllureDashboardAttachments(reportDirectory, finalDashboard);

        const [allureDashboard] = await Promise.all([
            readFile(
                path.join(allureResultsDirectory, allureAttachmentSource),
                'utf8'
            ),
        ]);
        expect(htmlAttachment.path).toBe(finalDashboardPath);
        expect(htmlAttachment.body).toBeUndefined();
        const htmlDashboardPath = htmlAttachment.path;
        if (!htmlDashboardPath) {
            throw new Error('HTML dashboard attachment path was not set');
        }
        expect(await readFile(htmlDashboardPath, 'utf8')).toBe(finalDashboard);
        expect(allureDashboard).toBe(finalDashboard);
    } finally {
        await rm(reportDirectory, { recursive: true, force: true });
    }
});
