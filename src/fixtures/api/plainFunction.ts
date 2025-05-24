import type { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * Supported HTTP methods for API requests.
 */
type HttpMethod = 'POST' | 'GET' | 'PUT' | 'DELETE';

/**
 * Parameters for making a simplified API request.
 */
interface ApiRequestParams {
    request: APIRequestContext;
    method: HttpMethod;
    url: string;
    baseUrl?: string;
    body?: Record<string, unknown> | null;
    headers?: Record<string, string>;
    authToken?: string; // optional bearer token (auto-added to headers)
}

/**
 * Simplified API request helper for Playwright's APIRequestContext.
 */
export async function apiRequest({
    request,
    method,
    url,
    baseUrl,
    body = null,
    headers = {},
    authToken,
}: ApiRequestParams): Promise<{ status: number; body: unknown }> {
    let response: APIResponse;

    // Construct request options
    const options: {
        data?: Record<string, unknown> | null;
        headers?: Record<string, string>;
    } = {
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
    };

    if (authToken) {
        options.headers = options.headers || {};
        options.headers['Authorization'] = `Token ${authToken}`;
    }

    if (body) {
        options.data = body;
    }

    const fullUrl = baseUrl ? `${baseUrl}${url}` : url;

    // Send the request
    switch (method.toUpperCase()) {
        case 'POST':
            response = await request.post(fullUrl, options);
            break;
        case 'GET':
            response = await request.get(fullUrl, options);
            break;
        case 'PUT':
            response = await request.put(fullUrl, options);
            break;
        case 'DELETE':
            response = await request.delete(fullUrl, options);
            break;
        default:
            throw new Error(`Unsupported HTTP method: ${method}`);
    }

    const status = response.status();
    const contentType = response.headers()['content-type'] || '';
    let bodyData: unknown = null;

    try {
        if (contentType.includes('application/json')) {
            bodyData = await response.json();
        } else if (contentType.includes('text/')) {
            bodyData = await response.text();
        } else {
            console.warn(`Unhandled response content-type: ${contentType}`);
        }
    } catch (err) {
        console.warn(`Failed to parse response body for status ${status}:`, err);
    }

    return { status, body: bodyData };
}
