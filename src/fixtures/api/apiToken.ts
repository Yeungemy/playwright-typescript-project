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

/**
 * Retrieves an OAuth2 access token using client credentials.
 *
 * @param params - Config with request context and auth details.
 * @returns A Promise resolving to the access token string.
 */
export async function getVoApiToken(params: GetVoApiTokenParams): Promise<string> {
    const { request, clientId, clientSecret, environment } =
        GetVoApiTokenParamsSchema.parse(params);

    const tokenUrl = `https://${environment}.onvitalobjects.com/VOIdentityServer/connect/token`;

    const body = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'write:MemberAccess',
        grant_type: 'client_credentials',
    });

    const response = await request.post(tokenUrl, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: body.toString(),
    });

    const responseBody = await response.text();
    expect(response.status(), `Failed to fetch token. Status: ${response.status()}, Body: ${responseBody}`).toBe(200);

    let json: Record<string, any>;
    try {
        json = JSON.parse(responseBody);
    } catch {
        throw new Error('Failed to parse token response as JSON');
    }

    if (!json.access_token) {
        throw new Error('Access token not found in response');
    }

    return json.access_token;
}
