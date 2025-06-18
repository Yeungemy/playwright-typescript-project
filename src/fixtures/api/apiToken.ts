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
import { executeQuery } from '../db/dbClient';
import { GetVoApiTokenWithClaimsParams, CachedToken } from './types';

const tokenCache: Record<string, CachedToken> = {};
export async function getVoApiTokenWithClaims(
    params: GetVoApiTokenWithClaimsParams
): Promise<string> {
    const { request, clientId, clientSecret, environment, identityServerUrl } =
        params;

    const cacheKey = `${environment}_${identityServerUrl}`;
    const now = Date.now();

    // Return cached token if valid
    const cached = tokenCache[cacheKey];
    if (cached && now < cached.expiresAt - 5000) {
        return cached.accessToken;
    }

    const tokenUrl = `https://${identityServerUrl}/connect/token`;
    console.log(`Requesting VOAPI token from ${tokenUrl}`);

    // Execute DB query directly using executeQuery
    const query = `
    SELECT TOP 1 OperProfileId 
    FROM OperatorProfile 
    WHERE LoginNm = '${process.env.AUTO_ADMIN_USER}' 
    ORDER BY OperProfileId
  `;
    const result = await executeQuery(query);
    const operProfileId = result.recordset[0]?.OperProfileId;

    if (!operProfileId) {
        throw new Error('OperProfileId not found for AUTOADMINUSER');
    }

    const formBody = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'write:MemberAccess',
        grant_type: 'client_credentials',
        'CWI-LoginName': 'AUTOADMINUSER',
        'CWI-OperatorId': operProfileId.toString(),
        'CWI-LockName': 'AUTOADMINUSER-portal',
    });

    const response = await request.post(tokenUrl, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: formBody.toString(),
    });

    const responseText = await response.text();
    expect(
        response.status(),
        `Token fetch failed. Response: ${responseText}`
    ).toBe(200);

    const json = JSON.parse(responseText);
    const accessToken = json.access_token;
    const expiresIn = json.expires_in;

    if (!accessToken || !expiresIn) {
        throw new Error('Missing access_token or expires_in in token response');
    }

    tokenCache[cacheKey] = {
        accessToken,
        expiresAt: now + expiresIn * 1000,
    };

    return accessToken;
}

/**
 * Retrieves an OAuth2 access token using client credentials.
 *
 * @param params - Config with request context and auth details.
 * @returns A Promise resolving to the access token string.
 */
export async function getVoApiToken(
    params: GetVoApiTokenParams
): Promise<string> {
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
