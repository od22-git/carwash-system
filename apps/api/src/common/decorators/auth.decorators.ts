import { createParamDecorator, SetMetadata, type ExecutionContext } from '@nestjs/common';
import type { Role } from '@carwash/shared';

export interface AuthUser {
  id: string;
  name: string;
  role: Role;
}

export const IS_PUBLIC_KEY = 'isPublic';
export const ROLES_KEY = 'roles';

/** Route needs no login (login, first-run setup, health). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/** Route is only for these roles. */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

/** The logged-in user, set by the JWT guard. */
export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthUser => ctx.switchToHttp().getRequest().user,
);
