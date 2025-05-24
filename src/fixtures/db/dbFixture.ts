import { test as base } from '@playwright/test';
import { connectToDb } from './dbClient';
import sql from 'mssql';

type DbFixture = {
    db: sql.ConnectionPool;
};

const test = base.extend<DbFixture>({
    db: async ({}, use) => {
        const pool = await connectToDb();
        await use(pool);
        await pool.close();
    },
});

export { test };
