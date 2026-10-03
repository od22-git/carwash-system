import { Body, Controller, Get, Headers, HttpCode, Post, Query } from '@nestjs/common';
import { DEVICE_HEADER, pushRequestSchema, type PushRequest } from '@carwash/shared';
import { z } from 'zod';
import { CurrentUser, ZodPipe, type AuthUser } from '../../common';
import { DevicesService } from '../devices/devices.service';
import { SyncService } from './sync.service';

const sinceSchema = z.coerce.number().int().min(0).default(0);

@Controller('sync')
export class SyncController {
  constructor(
    private readonly sync: SyncService,
    private readonly devices: DevicesService,
  ) {}

  @Post('push')
  @HttpCode(200)
  async push(
    @Body(new ZodPipe(pushRequestSchema)) body: PushRequest,
    @CurrentUser() user: AuthUser,
    @Headers(DEVICE_HEADER) deviceId?: string,
  ) {
    await this.devices.requireDevice(deviceId);
    return this.sync.push(user, body.ops);
  }

  @Get('pull')
  async pull(
    @Query('since', new ZodPipe(sinceSchema)) since: number,
    @CurrentUser() user: AuthUser,
    @Headers(DEVICE_HEADER) deviceId?: string,
  ) {
    await this.devices.requireDevice(deviceId);
    return this.sync.pull(user, since);
  }
}
