import { mkdir, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { FullResult, Reporter, TestCase } from '@playwright/test/reporter';
import {
    renderAgedFailuresDashboard,
    toAgedFailureDashboardItems,
} from './agedFailuresDashboard';
import {
    updateAllureDashboardAttachments,
    updateHtmlDashboardAttachments,
} from './dashboardAttachments';
import {
    getFailureAgeDays,
    readFailureHistory,
    updateFailureHistory,
    type FailureObservation,
} from './failureHistory';

type TestOutcome = 'failed' | 'passed' | 'flaky' | 'skipped';
type PlaywrightOutcome = ReturnType<TestCase['outcome']>;

type TestSummary = FailureObservation & {
    failureAgeDays?: number;
    firstFailedAt?: string;
    lastFailedAt?: string;
    observedFailureRuns?: number;
};

type RunSummary = {
    generatedAt: string;
    status: FullResult['status'];
    durationMs: number;
    counts: {
        total: number;
        passed: number;
        failed: number;
        flaky: number;
        skipped: number;
    };
    tests: TestSummary[];
};

function toObservation(test: TestCase): FailureObservation {
    const outcome = test.outcome();
    const statusByOutcome: Record<PlaywrightOutcome, TestOutcome> = {
        unexpected: 'failed',
        skipped: 'skipped',
        flaky: 'flaky',
        expected: 'passed',
    };

    return {
        id: test.id,
        title: test.title,
        project: test.parent.project()?.name ?? 'default',
        file: path.relative(process.cwd(), test.location.file),
        location: `${path.relative(process.cwd(), test.location.file)}:${test.location.line}:${test.location.column}`,
        status: statusByOutcome[outcome],
    };
}

async function writeAtomically(
    filePath: string,
    content: string
): Promise<void> {
    await mkdir(path.dirname(filePath), { recursive: true });
    const temporaryPath = `${filePath}.${process.pid}.tmp`;
    await writeFile(temporaryPath, content, 'utf8');
    await rename(temporaryPath, filePath);
}

export default class FailureHistoryReporter implements Reporter {
    private readonly outputDirectory = path.resolve(
        process.env.PLAYWRIGHT_REPORT_DIRECTORY ?? 'dist/test-report'
    );
    private readonly historyFile = path.resolve(
        process.env.PLAYWRIGHT_FAILURE_HISTORY_PATH ??
            '.playwright/failure-history.json'
    );
    private readonly executedTests = new Map<string, TestCase>();

    async onEnd(result: FullResult): Promise<void> {
        const now = new Date();
        const history = await readFailureHistory(this.historyFile);
        const observations = [...this.executedTests.values()].map(
            toObservation
        );
        const updatedHistory = updateFailureHistory(history, observations, now);
        const tests = observations.map((observation): TestSummary => {
            const record = updatedHistory.tests[observation.id];
            return {
                ...observation,
                ...(record
                    ? {
                          firstFailedAt: record.firstFailedAt,
                          lastFailedAt: record.lastFailedAt,
                          observedFailureRuns: record.observedFailureRuns,
                          ...(observation.status === 'failed'
                              ? {
                                    failureAgeDays: getFailureAgeDays(
                                        record.firstFailedAt,
                                        now
                                    ),
                                }
                              : {}),
                      }
                    : {}),
            };
        });
        const summary: RunSummary = {
            generatedAt: now.toISOString(),
            status: result.status,
            durationMs: result.duration,
            counts: {
                total: observations.length,
                passed: observations.filter(
                    (observation) => observation.status === 'passed'
                ).length,
                failed: observations.filter(
                    (observation) => observation.status === 'failed'
                ).length,
                flaky: observations.filter(
                    (observation) => observation.status === 'flaky'
                ).length,
                skipped: observations.filter(
                    (observation) => observation.status === 'skipped'
                ).length,
            },
            tests,
        };
        const failedRecords = observations
            .filter((observation) => observation.status === 'failed')
            .flatMap((observation) => {
                const record = updatedHistory.tests[observation.id];
                return record ? [record] : [];
            });
        const dashboard = renderAgedFailuresDashboard(
            toAgedFailureDashboardItems(failedRecords, now),
            now
        );
        await writeAtomically(
            this.historyFile,
            `${JSON.stringify(updatedHistory, null, 2)}\n`
        );
        await mkdir(this.outputDirectory, { recursive: true });
        await writeFile(
            path.join(this.outputDirectory, 'summary.json'),
            `${JSON.stringify(summary, null, 2)}\n`,
            'utf8'
        );
        await writeFile(
            path.join(this.outputDirectory, 'aged-failures-dashboard.md'),
            dashboard,
            'utf8'
        );
        updateHtmlDashboardAttachments(
            [...this.executedTests.values()],
            path.join(this.outputDirectory, 'aged-failures-dashboard.md')
        );
        await updateAllureDashboardAttachments(this.outputDirectory, dashboard);
    }

    onTestEnd(test: TestCase): void {
        this.executedTests.set(test.id, test);
    }
}
