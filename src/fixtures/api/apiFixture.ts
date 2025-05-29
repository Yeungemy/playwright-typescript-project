/**
 * @file apiRequestFixture.ts
 *
 * Extends Playwright's test fixture to provide a typed `apiRequest` helper.
 *
 * - Wraps `apiClient` to simplify calling APIs within tests.
 * - Injects typed API support directly into test contexts.
 * - Promotes reuse, consistency, and cleaner test code via abstraction.
 */

import { apiRequest } from './apiClient';
import { getVoApiToken } from './apiToken';
import { ApiRequestFn, ApiRequestParams, ApiRequestResponse } from './types';
import { test as base } from '@playwright/test';

export const test = base.extend<{
  apiToken: string;
  apiRequest: ApiRequestFn;
}>({
  apiToken: async ({ request }, use) => {
    const token = await getVoApiToken({
      request,
      clientId: process.env.CLIENT_ID!,
      clientSecret: process.env.CLIENT_SECRET!,
      environment: process.env.ENVIRONMENT!,
    });

    await use(token);
  }, // <- shared across all tests in a worker

  apiRequest: async ({ request, apiToken }, use) => {
    const wrappedRequest: ApiRequestFn = async <T = unknown>(params: ApiRequestParams) => {
      const response = await apiRequest({
        ...params,
        request,
        authToken: params.authToken ?? apiToken,
      });

      return {
        status: response.status,
        body: response.body as T,
      };
    };

    await use(wrappedRequest);
  },
});
