/**
 * @file schema.ts
 *
 * Defines reusable Zod schemas and types for API payload validation and inference.
 *
 * - Validates the structure of API data (e.g., users, error responses, token parameters).
 * - Provides type-safe models derived from schemas for use throughout the test framework.
 */

import type { APIRequestContext } from '@playwright/test';
import { z } from 'zod';

/**
 * Schema for retrieving a VO API token using client credentials.
 */
export const GetApiTokenParamsSchema = z.object({
    request: z.custom<APIRequestContext>(
        (value) =>
            typeof value === 'object' &&
            value !== null &&
            'post' in value &&
            typeof value.post === 'function'
    ),
    clientId: z.string().min(1),
    clientSecret: z.string().min(1),
    environment: z.string().min(1),
});

/** Type inferred from `GetApiTokenParamsSchema`. */
export type GetApiTokenParams = z.infer<typeof GetApiTokenParamsSchema>;

export const TokenResponseSchema = z.object({
    access_token: z.string().min(1),
    expires_in: z.number().positive().optional(),
});
