/**
 * @file types.ts
 * 
 * Defines TypeScript types and utility interfaces for making typed API requests.
 * 
 * - Declares supported HTTP methods.
 * - Describes parameter and response types for API operations.
 * - Centralizes shared type definitions across the API testing framework.
 */


/**
 * Supported HTTP methods for API requests.
 */
export type HttpMethod = 'POST' | 'GET' | 'PUT' | 'DELETE';

/**
 * Parameters for making an API request.
 */
export type ApiRequestParams = {
    /** HTTP method to be used for the request */
    method: HttpMethod;

    /** API path (relative if baseUrl is provided) */
    url: string;

    /** Optional base URL to prefix the endpoint */
    baseUrl?: string;

    /** Optional request body */
    body?: Record<string, unknown> | null;

    /** Optional headers to include in the request */
    headers?: Record<string, string>;

    /** Optional Bearer token (e.g., for Authorization) */
    authToken?: string;
};

/**
 * API response wrapper with status code and parsed body.
 */
export type ApiRequestResponse<T = unknown> = {
    status: number;
    body: T;
};

/**
 * Generic function interface for sending typed API requests.
 */
export type ApiRequestFn = <T = unknown>(
    params: ApiRequestParams
) => Promise<ApiRequestResponse<T>>;

/**
 * Group of available request methods used in fixtures.
 */
export type ApiRequestMethods = {
    apiRequest: ApiRequestFn;
};