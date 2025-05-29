import { test, expect } from '@playwright/test';
import { getVoApiToken } from '../../../fixtures/api/apiToken';
import { contextStore } from '../../../fixtures/api/contextStore';

test.describe('VOAPI Token Tests', () => {
    test('fetch VOAPI token', async ({ request }) => {
        const token = await getVoApiToken({
            request,
            clientId: process.env.VOAPI_CLIENT_ID!,
            clientSecret: process.env.VOAPI_CLIENT_SECRET!,
            environment: process.env.ENVIRONMENT!,
        });

        expect(token).toBeTruthy();
        contextStore.set('voApiToken', token);
        expect(contextStore.get('voApiToken')).toBe(token);
    });
});
