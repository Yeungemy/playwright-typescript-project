import { test, expect } from '../../../fixtures';

test.describe('Database Tests', () => {
    test('@database @sanity verifies the database connection', async ({
        database,
    }) => {
        const result = await database.request().query('SELECT 1 AS Connected');

        expect(result.recordset).toEqual([{ Connected: 1 }]);
    });
});
