/**
 * @file getVoApiToken.ts
 * 
 * Implements a helper function to obtain an OAuth2 access token from VOIdentityServer.
 * 
 * - Uses client credentials (client ID and secret) to request a bearer token.
 * - Validates input and ensures token is returned correctly.
 * - Logs detailed debug info for transparency.
 */


import { expect } from '@playwright/test';
import { GetVoApiTokenParamsSchema, GetVoApiTokenParams } from './schema';

export async function getVoApiToken(params: GetVoApiTokenParams): Promise<string> {
    const { request, clientId, clientSecret, environment } = GetVoApiTokenParamsSchema.parse(params);
    const tokenUrl = `https://${environment}.onvitalobjects.com/VOIdentityServer/connect/token`;

    console.log(`Requesting VO API token from ${tokenUrl}`);

    const formBody = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'write:MemberAccess',
        grant_type: 'client_credentials',
    }).toString();

    const response = await request.post(tokenUrl, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: formBody,
    });

    const responseBody = await response.text();
    console.log(`Response Status: ${response.status()}`);
    console.log(`Token Body: ${responseBody}`);

    expect(response.status()).toBe(200);
    const json = JSON.parse(responseBody);
    const token = json.access_token;

    if (!token) {
        throw new Error('Access token not found in response');
    }

    return token;
}
