import { test as base, expect, Page } from '@playwright/test';
import { connectToDb, closeDb } from '../../../fixtures/db/dbClient';

// Custom fixtures
type MyFixtures = {
    login: () => Promise<void>;
    db: any;
};

const testEx = base.extend<MyFixtures>({
    db: [
        async ({}, use: (dbConnection: any) => Promise<void>) => {
            const dbConnection = await connectToDb();
            await use(dbConnection);
            await closeDb(dbConnection);
        },
        { scope: 'worker' },
    ],

    login: [
        async ({ page }, use) => {
            await page.goto(process.env.BASE_URL!);
            await use(async () => {});
        },
        { scope: 'test' },
    ],
});

export { testEx as test, expect };
