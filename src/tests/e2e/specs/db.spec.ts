// src/tests/db/db.spec.ts
import { test, expect } from '@playwright/test';
import { connectToDb, closeDb } from '../../../utils/dbClient';
import sql from 'mssql';

let pool: sql.ConnectionPool;

test.describe('Database Tests', () => {
    test.beforeAll(async () => {
        pool = await connectToDb();

        await pool.request().query(`
      `);
    });

    test.afterAll(async () => {
        await closeDb(pool);
    });

    test('verify database connection', async () => {
        expect(1).toBe(1);
    });
});
