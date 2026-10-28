import { test as base } from '@playwright/test';
import { closeDb, connectToDb } from '../pages/database/connection';

type DatabaseWorkerFixture = {
    database: Awaited<ReturnType<typeof connectToDb>>;
};

const test = base.extend<{}, DatabaseWorkerFixture>({
    database: [
        async ({}, use) => {
            const pool = await connectToDb();
            try {
                await use(pool);
            } finally {
                await closeDb(pool);
            }
        },
        { scope: 'worker' },
    ],
});

export { test };
