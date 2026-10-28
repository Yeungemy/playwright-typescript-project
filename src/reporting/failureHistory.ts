import { readFile } from 'node:fs/promises';
import { z } from 'zod';

export type FailureObservation = {
    id: string;
    title: string;
    project: string;
    file: string;
    location?: string;
    status: 'failed' | 'passed' | 'flaky' | 'skipped';
};

export type FailureRecord = {
    id: string;
    title: string;
    project: string;
    file: string;
    location?: string;
    firstFailedAt: string;
    lastFailedAt: string;
    observedFailureRuns: number;
};

export type FailureHistory = {
    version: 1;
    updatedAt: string;
    tests: Record<string, FailureRecord>;
};

const historySchema = z.object({
    version: z.literal(1),
    updatedAt: z.string().datetime(),
    tests: z.record(
        z.string(),
        z.object({
            id: z.string(),
            title: z.string(),
            project: z.string(),
            file: z.string(),
            location: z.string().optional(),
            firstFailedAt: z.string().datetime(),
            lastFailedAt: z.string().datetime(),
            observedFailureRuns: z.number().int().positive(),
        })
    ),
});

export async function readFailureHistory(
    filePath: string
): Promise<FailureHistory> {
    let content: string;
    try {
        content = await readFile(filePath, 'utf8');
    } catch (error) {
        if (
            typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            error.code === 'ENOENT'
        ) {
            return {
                version: 1,
                updatedAt: new Date(0).toISOString(),
                tests: {},
            };
        }
        throw new Error(`Unable to read failure history at ${filePath}`, {
            cause: error,
        });
    }

    let data: unknown;
    try {
        data = JSON.parse(content);
    } catch (error) {
        throw new Error(`Failure history at ${filePath} is not valid JSON`, {
            cause: error,
        });
    }

    const parsed = historySchema.safeParse(data);
    if (!parsed.success) {
        throw new Error(
            `Failure history at ${filePath} does not match the supported schema`,
            { cause: parsed.error }
        );
    }
    return parsed.data;
}

export function getFailureAgeDays(firstFailedAt: string, now: Date): number {
    return Math.max(
        0,
        Math.floor(
            (now.getTime() - new Date(firstFailedAt).getTime()) / 86_400_000
        )
    );
}

export function updateFailureHistory(
    previousHistory: FailureHistory,
    observations: FailureObservation[],
    now: Date
): FailureHistory {
    const updatedTests = { ...previousHistory.tests };
    const timestamp = now.toISOString();

    for (const observation of observations) {
        if (observation.status === 'passed' || observation.status === 'flaky') {
            delete updatedTests[observation.id];
            continue;
        }

        if (observation.status === 'skipped') {
            continue;
        }

        const previousRecord = updatedTests[observation.id];
        updatedTests[observation.id] = {
            id: observation.id,
            title: observation.title,
            project: observation.project,
            file: observation.file,
            ...(observation.location ? { location: observation.location } : {}),
            firstFailedAt: previousRecord?.firstFailedAt ?? timestamp,
            lastFailedAt: timestamp,
            observedFailureRuns: (previousRecord?.observedFailureRuns ?? 0) + 1,
        };
    }

    return {
        version: 1,
        updatedAt: timestamp,
        tests: updatedTests,
    };
}
