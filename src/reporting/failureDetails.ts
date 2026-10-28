import { getFailureAgeDays, type FailureRecord } from './failureHistory';

type FailureDetails = {
    title: string;
    location: string;
    project: string;
    failureCount: number;
    firstFailedAt: string;
    lastFailedAt: string;
    now: Date;
};

function formatFailureDetails(details: FailureDetails): string {
    const firstFailedAt = details.firstFailedAt;
    const ageDays = getFailureAgeDays(firstFailedAt, details.now);

    return [
        `Test case: ${details.title}`,
        `Location: ${details.location}`,
        `Project: ${details.project}`,
        `Age: ${ageDays} day(s)`,
        `Consecutive failed runs: ${details.failureCount}`,
        `First failed: ${firstFailedAt}`,
        `Last failed: ${details.lastFailedAt}`,
    ].join('\n');
}

export function createFailureDetails(
    title: string,
    location: string,
    project: string,
    previousRecord: FailureRecord | undefined,
    now: Date
): string {
    const firstFailedAt = previousRecord?.firstFailedAt ?? now.toISOString();

    return formatFailureDetails({
        title,
        location,
        project,
        failureCount: (previousRecord?.observedFailureRuns ?? 0) + 1,
        firstFailedAt,
        lastFailedAt: now.toISOString(),
        now,
    });
}
