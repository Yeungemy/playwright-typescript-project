import { readdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const reportDirectory = path.resolve(
    process.env.PLAYWRIGHT_REPORT_DIRECTORY ?? 'dist/test-report'
);
const resultsDirectory = path.resolve(
    process.env.ALLURE_RESULTS_DIRECTORY ??
        path.join(reportDirectory, 'allure-results')
);
const summaryPath = path.join(reportDirectory, 'summary.json');
const summary = JSON.parse(await readFile(summaryPath, 'utf8'));
const dashboardPath = path.join(reportDirectory, 'aged-failures-dashboard.md');

function normalizePath(value) {
    return value.replaceAll('\\', '/');
}

function findFailedTest(result) {
    if (result.status !== 'failed') {
        return undefined;
    }

    const resultLocation = normalizePath(result.fullName ?? '');
    const candidates = summary.tests.filter(
        (test) =>
            test.status === 'failed' &&
            (test.title === result.name ||
                test.title.endsWith(` › ${result.name}`))
    );
    const locationMatch = resultLocation
        ? candidates.find((test) =>
              normalizePath(test.location).endsWith(resultLocation)
          )
        : undefined;

    return (
        locationMatch ?? (candidates.length === 1 ? candidates[0] : undefined)
    );
}

const resultFiles = (await readdir(resultsDirectory))
    .filter((name) => name.endsWith('-result.json'))
    .map((name) => path.join(resultsDirectory, name));
const failedTests = summary.tests.filter((test) => test.status === 'failed');
const dashboardSource = 'aged-failures-dashboard.md';
if (failedTests.length > 0) {
    const dashboard = await readFile(dashboardPath);
    await writeFile(path.join(resultsDirectory, dashboardSource), dashboard);
}

for (const resultFile of resultFiles) {
    const result = JSON.parse(await readFile(resultFile, 'utf8'));
    const test = findFailedTest(result);
    if (!test) {
        continue;
    }

    const labels = (result.labels ?? []).filter(
        ({ name }) => name !== 'failure_count' && name !== 'failure_age'
    );
    labels.push({
        name: 'failure_count',
        value: `${test.observedFailureRuns ?? 1} consecutive failed run(s)`,
    });
    labels.push({
        name: 'failure_age',
        value: `${test.failureAgeDays ?? 0} day(s)`,
    });
    result.labels = labels;
    result.attachments = (result.attachments ?? []).filter(
        ({ name }) => name !== 'Aged failed cases dashboard'
    );
    result.attachments.push({
        name: 'Aged failed cases dashboard',
        source: dashboardSource,
        type: 'text/markdown',
    });
    await writeFile(resultFile, `${JSON.stringify(result)}\n`, 'utf8');
}

const properties = {
    Run_status: summary.status ?? 'unknown',
    Total_tests: summary.counts?.total ?? 'unknown',
    Passed_tests: summary.counts?.passed ?? 'unknown',
    Failed_tests: summary.counts?.failed ?? 'unknown',
    Flaky_tests: summary.counts?.flaky ?? 'unknown',
    Skipped_tests: summary.counts?.skipped ?? 'unknown',
    OS_platform: os.platform(),
    OS_release: os.release(),
    Node_version: process.version,
    Failed_test_case_details:
        'Open a failed test case to view its consecutive failed-run count and error details.',
};

const content = Object.entries(properties)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

await writeFile(
    path.join(resultsDirectory, 'environment.properties'),
    `${content}\n`,
    'utf8'
);
