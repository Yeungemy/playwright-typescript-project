import { z } from 'zod';

/**
 * Schema representing an author or user profile.
 */
export const AuthorSchema = z.object({
  username: z.string(),
  bio: z.string().nullable(),
  image: z.string(),
  following: z.boolean().optional(), // Optional in user context
});

/**
 * Schema representing an authenticated user.
 */
export const UserSchema = z.object({
  user: AuthorSchema.extend({
    email: z.string().email(),
    token: z.string(),
  }),
});

/**
 * Schema for a typical error response with optional fields.
 */
export const ErrorResponseSchema = z.object({
  errors: z.object({
    email: z.array(z.string()).optional(),
    username: z.array(z.string()).optional(),
    password: z.array(z.string()).optional(),
  }),
});


