import { test, expect } from '@playwright/test';
import { getApiToken } from '../../../fixtures/api/apiToken';
import { contextStore } from '../../../fixtures/api/contextStore';

test.describe('VOAPI Token Tests', () => {
    test('fetch VOAPI token', async ({ request }) => {
        const token = await getApiToken({
            request,
            clientId: process.env.API_CLIENT_ID!,
            clientSecret: process.env.API_PASSWORD!,
            environment: process.env.ENVIRONMENT!
        });

        expect(token).toBeTruthy();
        contextStore.set('apiToken', token);
        expect(contextStore.get('apiToken')).toBe(token);
    });
});