/**
 * @file schema.ts
 * 
 * Defines reusable Zod schemas and types for API payload validation and inference.
 * 
 * - Validates the structure of API data (e.g., users, error responses, token parameters).
 * - Provides type-safe models derived from schemas for use throughout the test framework.
 */



import { APIRequestContext } from '@playwright/test';
import { z } from 'zod';

/**
 * Schema for retrieving a VO API token using client credentials.
 */
export const GetVoApiTokenParamsSchema = z.object({
    request: z.custom<APIRequestContext>(),
    clientId: z.string(),
    clientSecret: z.string(),
    environment: z.string(),
});





/** Type inferred from `GetVoApiTokenParamsSchema` */
export type GetVoApiTokenParams = z.infer<typeof GetVoApiTokenParamsSchema>;