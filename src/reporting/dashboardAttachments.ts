import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

type DashboardTestResult = {
    attachments: Array<{
        name: string;
        body?: Buffer;
        path?: string;
    }>;
};

type DashboardTestCase = {
    results: DashboardTestResult[];
};

function findDashboardSources(value: unknown, sources: string[]): void {
    if (Array.isArray(value)) {
        for (const entry of value) {
            findDashboardSources(entry, sources);
        }
        return;
    }

    if (typeof value !== 'object' || value === null) {
        return;
    }

    if (
        'name' in value &&
        value.name === 'Aged failed cases dashboard' &&
        'source' in value &&
        typeof value.source === 'string'
    ) {
        sources.push(value.source);
    }

    for (const entry of Object.values(value)) {
        findDashboardSources(entry, sources);
    }
}

export function updateHtmlDashboardAttachments(
    tests: DashboardTestCase[],
    dashboardPath: string
): void {
    for (const test of tests) {
        for (const result of test.results) {
            for (const attachment of result.attachments) {
                if (attachment.name === 'Aged failed cases dashboard') {
                    attachment.path = dashboardPath;
                    delete attachment.body;
                }
            }
        }
    }
}

export async function updateAllureDashboardAttachments(
    reportDirectory: string,
    dashboard: string
): Promise<void> {
    const allureResultsDirectory = path.join(reportDirectory, 'allure-results');
    const files = await readdir(allureResultsDirectory, {
        withFileTypes: true,
    });
    const resultFiles = files.filter(
        (file) => file.isFile() && file.name.endsWith('-result.json')
    );

    for (const resultFile of resultFiles) {
        const resultPath = path.join(allureResultsDirectory, resultFile.name);
        let result: unknown;
        try {
            result = JSON.parse(await readFile(resultPath, 'utf8'));
        } catch (error) {
            throw new Error(`Unable to read Allure result at ${resultPath}`, {
                cause: error,
            });
        }

        const sources: string[] = [];
        findDashboardSources(result, sources);
        for (const source of sources) {
            const attachmentPath = path.resolve(allureResultsDirectory, source);
            if (path.dirname(attachmentPath) !== allureResultsDirectory) {
                throw new Error(
                    `Invalid Allure attachment path in ${resultPath}: ${source}`
                );
            }
            await writeFile(attachmentPath, dashboard, 'utf8');
        }
    }
}
