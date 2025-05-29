/**
 * @file apiClient.ts
 *
 * Provides a low-level utility function to send API requests using Playwright's `APIRequestContext`.
 *
 * - Supports all major HTTP methods (GET, POST, PUT, DELETE).
 * - Handles setting headers, encoding body, and parsing response based on content type.
 * - Designed to be used by higher-level utilities like fixtures or test helpers.
 */

import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { ApiRequestParams } from './types';

/**
 * Centralized API client for Playwright.
 */
export async function apiRequest({
    request,
    method,
    url,
    baseUrl,
    body = null,
    headers = {},
    authToken,
}: ApiRequestParams & { request: APIRequestContext }): Promise<{
    status: number;
    body: unknown;
}> {
    const fullUrl = baseUrl ? `${baseUrl}${url}` : url;

    const options: {
        data?: Record<string, unknown> | null;
        headers: Record<string, string>;
    } = {
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
    };

    if (authToken) {
        options.headers['Authorization'] = `Token ${authToken}`;
    }

    if (body) {
        options.data = body;
    }

    const methodName = method.toLowerCase() as keyof APIRequestContext;
    const methodFn = request[methodName] as (
        url: string,
        options?: any
    ) => Promise<APIResponse>;

    if (!methodFn) {
        throw new Error(`Unsupported HTTP method: ${method}`);
    }

    const response: APIResponse = await methodFn.call(
        request,
        fullUrl,
        options
    );
    const contentType = response.headers()['content-type'] || '';
    let parsed: unknown;

    try {
        if (contentType.includes('application/json')) {
            parsed = await response.json();
        } else if (contentType.includes('text/')) {
            parsed = await response.text();
        } else {
            console.warn(`Unhandled response type: ${contentType}`);
        }
    } catch (err) {
        console.warn('Error parsing response:', err);
    }

    return {
        status: response.status(),
        body: parsed,
    };
}
