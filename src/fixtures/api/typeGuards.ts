import { z } from 'zod';
import type {
  UserSchema,
  ErrorResponseSchema
} from './schemas';

/**
 * Represents parameters for making an API request.
 */
export type ApiRequestParams = {
  /** The HTTP method to use */
  method: 'POST' | 'GET' | 'PUT' | 'DELETE';
  
  /** The endpoint path (relative to `baseUrl` if provided) */
  url: string;
  
  /** Optional base URL to prepend to the endpoint */
  baseUrl?: string;
  
  /** Optional payload to send with the request */
  body?: Record<string, unknown> | null;
  
  /** Optional HTTP headers to include in the request */
  headers?: Record<string, string>;
};

/**
 * Represents the structure of a response from an API request.
 * 
 * @template T - The shape of the response body
 */
export type ApiRequestResponse<T = unknown> = {
  /** HTTP status code */
  status: number;

  /** Parsed response body */
  body: T;
};

/**
 * Function signature for an API request handler.
 * 
 * @template T - The expected response type
 */
export type ApiRequestFn = <T = unknown>(
  params: ApiRequestParams
) => Promise<ApiRequestResponse<T>>;

/**
 * Groups available API methods.
 */
export type ApiRequestMethods = {
  apiRequest: ApiRequestFn;
};

// Inferred types from Zod schemas
export type User = z.infer<typeof UserSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
