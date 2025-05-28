import { test as base, expect } from '@playwright/test';
import { connectToDb, closeDb } from '../../../fixtures/db/dbClient';

// Custom fixtures
type MyFixtures = {
    db: any;
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
});

export { testEx as test, expect };
