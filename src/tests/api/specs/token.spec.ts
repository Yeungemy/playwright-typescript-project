import { test, expect } from '@playwright/test';
import { getVoApiToken } from '../../../fixtures/api/getApiToken';

test.describe('VOAPI Token Tests', () => {
    test('fetch VOAPI token and use it', async ({ request }) => {
    const token = await getVoApiToken({
        request,
        clientId: process.env.VOAPI_CLIENT_ID!,
        clientSecret: process.env.VOAPI_CLIENT_SECRET!,
        environment: process.env.ENVIRONMENT!,
    });

        expect(token).toBeTruthy();

    });
});