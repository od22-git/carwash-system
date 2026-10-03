import { Body, Controller, Post } from '@nestjs/common';
import { registerDeviceSchema, type RegisterDeviceRequest } from '@carwash/shared';
import { CurrentUser, ZodPipe, type AuthUser } from '../../common';
import { DevicesService } from './devices.service';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devices: DevicesService) {}

  @Post()
  register(
    @Body(new ZodPipe(registerDeviceSchema)) body: RegisterDeviceRequest,
    @CurrentUser() user: AuthUser,
  ) {
    return this.devices.register(body.name, user.id);
  }
}
