// src/tests/db/db.spec.ts
import { test, expect } from './baseTest';

test.describe('Database Tests', () => {
    test('verify database connection', async ({ db }) => {
        const request = db.request();
        request.input('MemberId', 17170); 
        const result = await request.query(
            'SELECT ClientPlanId FROM Member WHERE MemberId = @MemberId'
        );

        expect(result.recordset.length).toBe(1);
        expect(result.recordset[0].ClientPlanId).toBe(10013);
    });
});
