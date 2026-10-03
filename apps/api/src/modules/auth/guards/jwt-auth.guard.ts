import {
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY, type AuthUser } from '../../../common';
import { UsersService } from '../../users/users.service';
import type { TokenPayload } from '../token-payload';

/** Every route needs a valid token from an active user, unless marked @Public(). */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly users: UsersService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;

    const request = ctx.switchToHttp().getRequest();
    const token = /^Bearer (.+)$/.exec(request.headers.authorization ?? '')?.[1];
    if (!token) throw new UnauthorizedException('Login required');

    const payload = await this.jwt.verifyAsync<TokenPayload>(token).catch(() => null);
    const user = payload && (await this.users.findActive(payload.sub));
    if (!user) throw new UnauthorizedException('Session expired or account disabled');

    request.user = { id: user.id, name: user.name, role: user.role } satisfies AuthUser;
    return true;
  }
}
