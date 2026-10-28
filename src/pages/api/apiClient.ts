import type { APIRequestContext } from '@playwright/test';
import type { ApiRequestParams, ApiRequestResponse } from './types';

export async function apiRequest({
    request,
    method,
    url,
    baseUrl,
    body = null,
    headers = {},
    authToken,
}: ApiRequestParams & {
    request: APIRequestContext;
}): Promise<ApiRequestResponse> {
    const fullUrl = baseUrl
        ? new URL(url, `${baseUrl.replace(/\/+$/, '')}/`).toString()
        : url;
    const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...headers,
    };

    if (authToken) {
        requestHeaders.Authorization = `Token ${authToken}`;
    }

    const response = await request.fetch(fullUrl, {
        method,
        headers: requestHeaders,
        ...(body === null ? {} : { data: body }),
    });
    const contentType = response.headers()['content-type'] || '';
    const responseBody = contentType.includes('json')
        ? await response.json()
        : await response.text();

    return {
        status: response.status(),
        body: responseBody,
    };
}
