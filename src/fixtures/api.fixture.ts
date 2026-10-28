import { apiRequest } from '../pages/api/apiClient';
import { getApiToken } from '../pages/api/tokenClient';
import type { ApiRequestFn, ApiRequestParams } from '../pages/api/types';
import { test as base } from '@playwright/test';
import { environment, requireEnvironmentValue } from '../config/environment';

export type ApiFixture = {
    api: {
        token: string;
        request: ApiRequestFn;
    };
};

export const test = base.extend<ApiFixture>({
    api: async ({ request }, use) => {
        const token = await getApiToken({
            request,
            clientId: requireEnvironmentValue(
                environment.apiClientId,
                'API_CLIENT_ID'
            ),
            clientSecret: requireEnvironmentValue(
                environment.apiPassword,
                'API_PASSWORD'
            ),
            environment: requireEnvironmentValue(
                environment.environmentName,
                'ENVIRONMENT'
            ),
        });
        const wrappedRequest: ApiRequestFn = (params: ApiRequestParams) =>
            apiRequest({
                ...params,
                baseUrl:
                    params.baseUrl ??
                    requireEnvironmentValue(environment.apiUrl, 'API_URL'),
                request,
                authToken: params.authToken ?? token,
            });

        await use({
            token,
            request: wrappedRequest,
        });
    },
});
