/**
 * @file apiRequestFixture.ts
 * 
 * Extends Playwright's test fixture to provide a typed `apiRequest` helper.
 * 
 * - Wraps `apiClient` to simplify calling APIs within tests.
 * - Injects typed API support directly into test contexts.
 * - Promotes reuse, consistency, and cleaner test code via abstraction.
 */



import { apiRequest } from "./apiClient";
import { getVoApiToken } from "./getApiToken";
import { ApiRequestFn, ApiRequestParams, ApiRequestResponse } from "./types";


apiRequest: async ({ request }: { request: any }, use: any) => {
    const token = await getVoApiToken({
        request,
        clientId: process.env.CLIENT_ID!,
        clientSecret: process.env.CLIENT_SECRET!,
        environment: process.env.ENVIRONMENT!,
    });

    const wrappedRequest: ApiRequestFn = async <T = unknown>(
        params: ApiRequestParams
    ): Promise<ApiRequestResponse<T>> => {
        const response = await apiRequest({
            request,
            ...params,
            authToken: params.authToken || token, // fallback to auto token
        });

        return {
            status: response.status,
            body: response.body as T,
        };
    };

    await use(wrappedRequest);
}
