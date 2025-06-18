import { test, expect } from '@playwright/test';
import { getVoApiToken, getVoApiTokenWithClaims } from '../../../fixtures/api/apiToken';
import { contextStore } from '../../../fixtures/api/contextStore';

test.describe('VOAPI Token Tests', () => {
    test('fetch VOAPI token', async ({ request }) => {
        const token = await getVoApiToken({
            request,
            clientId: process.env.API_CLIENT_ID!,
            clientSecret: process.env.API_PASSWORD!,
            environment: process.env.ENVIRONMENT!
        });

        expect(token).toBeTruthy();
        contextStore.set('voApiToken', token);
        expect(contextStore.get('voApiToken')).toBe(token);
    });

    test('fetch VOAPI token with claims', async ({ request }) => {
        const token = await getVoApiTokenWithClaims({
            request,
            clientId: process.env.API_CLIENT_ID!,
            clientSecret: process.env.API_PASSWORD!,
            environment: process.env.ENVIRONMENT!,
            identityServerUrl: process.env.IDENTITY_SERVER_URL!          
        });

        expect(token).toBeTruthy();
        contextStore.set('voApiToken', token);
        expect(contextStore.get('voApiToken')).toBe(token);
    });
});
