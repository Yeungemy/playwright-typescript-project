/**
 * @file tokenClient.ts
 *
 * Implements a helper function to obtain an OAuth2 access token from VOIdentityServer.
 *
 * - Uses client credentials (client ID and secret) to request a bearer token.
 * - Validates input and ensures token is returned correctly.
 */

import { createHash } from 'node:crypto';
import type { GetApiTokenParams } from './schema';
import { GetApiTokenParamsSchema, TokenResponseSchema } from './schema';
import type { CachedToken } from './types';
import {
    environment as appEnvironment,
    requireEnvironmentValue,
} from '../../config/environment';

const tokenCache: Record<string, CachedToken> = {};
/**
 * Retrieves an OAuth2 access token using client credentials.
 *
 * @param params - Config with request context and auth details.
 * @returns A Promise resolving to the access token string.
 */
export async function getApiToken(params: GetApiTokenParams): Promise<string> {
    const { request, clientId, clientSecret, environment } =
        GetApiTokenParamsSchema.parse(params);

    const apiUrl = requireEnvironmentValue(appEnvironment.apiUrl, 'API_URL');
    const secretFingerprint = createHash('sha256')
        .update(clientSecret)
        .digest('hex');
    const cacheKey = `${environment}_${clientId}_${secretFingerprint}_${apiUrl}`;
    const now = Date.now();

    const cached = tokenCache[cacheKey];
    if (cached && now < cached.expiresAt - 5000) {
        return cached.accessToken;
    }

    const tokenUrl = new URL('connect/token', `${apiUrl}/`).toString();
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

    if (!response.ok()) {
        throw new Error(
            `Token request failed with HTTP status ${response.status()}`
        );
    }

    const tokenResponse = TokenResponseSchema.parse(await response.json());
    if (tokenResponse.expires_in) {
        tokenCache[cacheKey] = {
            accessToken: tokenResponse.access_token,
            expiresAt: Date.now() + tokenResponse.expires_in * 1000,
        };
    }
    return tokenResponse.access_token;
}
