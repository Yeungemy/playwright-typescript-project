import { getFailureAgeDays, type FailureRecord } from './failureHistory';

export const AGED_FAILURE_THRESHOLD_DAYS = 30;
export const AGED_FAILURE_DASHBOARD_TITLE = '# Failed test cases and aging';

export type AgedFailureDashboardItem = FailureRecord & {
    failureAgeDays: number;
};

function escapeMarkdownCell(value: string): string {
    return value.replaceAll('|', '\\|').replaceAll('\n', ' ');
}

export function renderAgedFailuresDashboard(
    failures: AgedFailureDashboardItem[],
    now: Date
): string {
    const orderedFailures = [...failures].sort(
        (left, right) =>
            right.failureAgeDays - left.failureAgeDays ||
            right.observedFailureRuns - left.observedFailureRuns ||
            left.title.localeCompare(right.title)
    );
    const agedFailureCount = orderedFailures.filter(
        (failure) => failure.failureAgeDays >= AGED_FAILURE_THRESHOLD_DAYS
    ).length;
    const rows = orderedFailures.map(
        (failure) =>
            `| ${escapeMarkdownCell(failure.title)} | ${escapeMarkdownCell(failure.location ?? failure.file)} | ${escapeMarkdownCell(failure.project)} | ${failure.failureAgeDays} | ${failure.observedFailureRuns} | ${failure.failureAgeDays >= AGED_FAILURE_THRESHOLD_DAYS ? 'Yes' : 'No'} |`
    );

    return [
        AGED_FAILURE_DASHBOARD_TITLE,
        '',
        `Updated: ${now.toISOString()}`,
        '',
        `Current failed cases: ${failures.length}`,
        `Aged failures (>= ${AGED_FAILURE_THRESHOLD_DAYS} days): ${agedFailureCount}`,
        '',
        '| Test case | Location | Project | Age (days) | Consecutive failed runs | Aged |',
        '| --- | --- | --- | ---: | ---: | --- |',
        ...(rows.length > 0
            ? rows
            : ['| No failed cases in this run. | - | - | - | - | - |']),
        '',
    ].join('\n');
}

export function toAgedFailureDashboardItems(
    failures: FailureRecord[],
    now: Date
): AgedFailureDashboardItem[] {
    return failures.map((failure) => ({
        ...failure,
        failureAgeDays: getFailureAgeDays(failure.firstFailedAt, now),
    }));
}
