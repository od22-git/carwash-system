import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import {
  loginRequestSchema,
  setupRequestSchema,
  type LoginRequest,
  type SetupRequest,
} from '@carwash/shared';
import { CurrentUser, Public, ZodPipe, type AuthUser } from '../../common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Get('setup-status')
  async setupStatus() {
    return { needsSetup: await this.auth.needsSetup() };
  }

  @Public()
  @Post('setup')
  setup(@Body(new ZodPipe(setupRequestSchema)) body: SetupRequest) {
    return this.auth.setup(body);
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  login(@Body(new ZodPipe(loginRequestSchema)) body: LoginRequest) {
    return this.auth.login(body.username, body.password);
  }

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return user;
  }
}
