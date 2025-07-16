import { test as base, expect } from '@playwright/test';
import { connectToDb, closeDb } from '../fixtures/db/dbClient';
import { getApiToken } from '../fixtures/api/apiToken';

// Custom fixtures
type MyFixtures = {
    db: any;
    token: string;
    tokenWithClaims: string;
};

const testEx = base.extend<MyFixtures>({
    db: [
        async ({}, use: (dbConnection: any) => Promise<void>) => {
            // 1. Open DB connection
            const dbConnection = await connectToDb();
            // 2. Give it to the test, wait for the test to finish
            await use(dbConnection);
            // 3. After the test (or all tests in worker), close connection
            await closeDb(dbConnection);
        },
        // 4. Share one connection across all tests in the same worker
        { scope: 'worker' },
    ],

    // ✅ Token Fixture (test scoped — must be, since it's a primitive string)
    token: [
        async ({ request }, use) => {
            const token = await getApiToken({
                request,
                clientId: process.env.API_CLIENT_ID!,
                clientSecret: process.env.API_PASSWORD!,
                environment: process.env.ENVIRONMENT!,
            });
            await use(token);
        },
        { scope: 'test' },
    ],
});

export { testEx as test, expect };
