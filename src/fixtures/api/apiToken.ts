/**
 * @file getapiToken.ts
 *
 * Implements a helper function to obtain an OAuth2 access token from VOIdentityServer.
 *
 * - Uses client credentials (client ID and secret) to request a bearer token.
 * - Validates input and ensures token is returned correctly.
 * - Logs detailed debug info for transparency.
 */

import { expect } from '@playwright/test';
import { GetaApiTokenParamsSchema, GetApiTokenParams } from './schema';
import { executeQuery } from '../db/dbClient';
import { GetApiTokenWithClaimsParams, CachedToken } from './types';

const tokenCache: Record<string, CachedToken> = {};
/**
 * Retrieves an OAuth2 access token using client credentials.
 *
 * @param params - Config with request context and auth details.
 * @returns A Promise resolving to the access token string.
 */
export async function getApiToken(params: GetApiTokenParams): Promise<string> {
    const { request, clientId, clientSecret, environment } =
        GetaApiTokenParamsSchema.parse(params);

    const cacheKey = `${environment}_${process.env.API_URL}`;
    const now = Date.now();

    // Return cached token if valid
    const cached = tokenCache[cacheKey];
    if (cached && now < cached.expiresAt - 5000) {
        return cached.accessToken;
    }

    const tokenUrl = `https://${environment}.${process.env.API_URL}/connect/token`;
    console.log(`Requesting VOAPI token from ${tokenUrl}`);

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
    expect(
        response.status(),
        `Failed to fetch token. Status: ${response.status()}, Body: ${responseBody}`
    ).toBe(200);

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
