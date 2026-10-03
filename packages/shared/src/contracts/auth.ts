import { z } from 'zod';
import { ROLES, type Role } from '../users';

export const usernameSchema = z
  .string()
  .trim()
  .min(3)
  .max(32)
  .regex(/^[a-z0-9_.-]+$/i, 'English letters, numbers, dot, dash or underscore only');

export const passwordSchema = z.string().min(6).max(128);

export const loginRequestSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});
export type LoginRequest = z.infer<typeof loginRequestSchema>;

/** First run only: creates the admin account when the system has no users yet. */
export const setupRequestSchema = z.object({
  name: z.string().trim().min(2).max(60),
  username: usernameSchema,
  password: passwordSchema,
});
export type SetupRequest = z.infer<typeof setupRequestSchema>;

export const createUserSchema = setupRequestSchema.extend({ role: z.enum(ROLES) });
export type CreateUserRequest = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  name: z.string().trim().min(2).max(60).optional(),
  password: passwordSchema.optional(),
  active: z.boolean().optional(),
});
export type UpdateUserRequest = z.infer<typeof updateUserSchema>;

export interface SessionUser {
  id: string;
  name: string;
  username: string;
  role: Role;
}

export interface LoginResponse {
  token: string;
  user: SessionUser;
}
