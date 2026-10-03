import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { LoginResponse, SessionUser, SetupRequest } from '@carwash/shared';
import { UsersService } from '../users/users.service';
import type { TokenPayload } from './token-payload';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async needsSetup(): Promise<boolean> {
    return !(await this.users.hasAnyUser());
  }

  /** First run: creates the admin account. Refused once any user exists. */
  async setup(input: SetupRequest): Promise<LoginResponse> {
    if (!(await this.needsSetup())) throw new ForbiddenException('Setup is already done');
    const user = await this.users.create({ ...input, role: 'admin' });
    return this.issue(user);
  }

  async login(username: string, password: string): Promise<LoginResponse> {
    const user = await this.users.verifyCredentials(username, password);
    if (!user) throw new UnauthorizedException('Wrong username or password');
    return this.issue(user);
  }

  private async issue(user: SessionUser): Promise<LoginResponse> {
    const payload: TokenPayload = { sub: user.id, role: user.role, name: user.name };
    return { token: await this.jwt.signAsync(payload), user };
  }
}
