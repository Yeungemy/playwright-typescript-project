import { test as base } from '@playwright/test';
import { apiRequest as apiRequestOriginal } from './plainFunction';
import type {
  ApiRequestFn,
  ApiRequestMethods,
  ApiRequestParams,
  ApiRequestResponse,
} from './typeGuards';

/**
 * Playwright fixture extension that provides an `apiRequest` utility.
 */
export const test = base.extend<ApiRequestMethods>({
  /**
   * `apiRequest` lets you send typed API requests with custom headers/body.
   * Automatically reuses Playwright's request context.
   */
  apiRequest: async ({ request }, use) => {
    const apiRequestFn: ApiRequestFn = async <T = unknown>(
      params: ApiRequestParams
    ): Promise<ApiRequestResponse<T>> => {
      const response = await apiRequestOriginal({
        request,
        ...params, // includes method, url, body, baseUrl, headers, authToken
      });

      return {
        status: response.status,
        body: response.body as T,
      };
    };

    await use(apiRequestFn);
  },
});
