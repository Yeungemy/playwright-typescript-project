export type HttpMethod =
    | 'GET'
    | 'POST'
    | 'PUT'
    | 'PATCH'
    | 'DELETE'
    | 'HEAD'
    | 'OPTIONS';

export type JsonValue =
    | string
    | number
    | boolean
    | null
    | JsonValue[]
    | { [key: string]: JsonValue };

export type ApiRequestParams = {
    method: HttpMethod;
    url: string;
    baseUrl?: string;
    body?: JsonValue;
    headers?: Record<string, string>;
    authToken?: string;
};

export type ApiRequestResponse = {
    status: number;
    body: unknown;
};

export type ApiRequestFn = (
    params: ApiRequestParams
) => Promise<ApiRequestResponse>;

export interface CachedToken {
    accessToken: string;
    expiresAt: number;
}
