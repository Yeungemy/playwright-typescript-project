import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

export default async function globalSetup(): Promise<void> {
    const reportDirectory = path.resolve(
        process.env.PLAYWRIGHT_REPORT_DIRECTORY ?? 'dist/test-report'
    );
    const allureResultsDirectory = path.join(reportDirectory, 'allure-results');

    await mkdir(reportDirectory, { recursive: true });
    await rm(allureResultsDirectory, { recursive: true, force: true });
    await mkdir(allureResultsDirectory, { recursive: true });
    await rm(path.join(reportDirectory, 'aged-failures-dashboard.md'), {
        force: true,
    });
}
