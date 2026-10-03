import { BadRequestException, Injectable } from '@nestjs/common';
import type { DeviceInfo } from '@carwash/shared';
import { nextDevicePrefix } from './device-prefix';
import { DevicesRepository } from './devices.repository';

const UUID = /^[0-9a-f-]{36}$/i;
const MAX_ATTEMPTS = 3;

@Injectable()
export class DevicesService {
  constructor(private readonly repo: DevicesRepository) {}

  async register(name: string, userId: string): Promise<DeviceInfo> {
    // Two laptops registering at the same moment could pick the same prefix; retry on clash.
    for (let attempt = 1; ; attempt++) {
      const prefix = nextDevicePrefix(await this.repo.usedPrefixes());
      try {
        const row = await this.repo.insert({ name, prefix, registeredBy: userId });
        return { id: row.id, name: row.name, prefix: row.prefix };
      } catch (error) {
        if (attempt >= MAX_ATTEMPTS) throw error;
      }
    }
  }

  /** Used by sync: the request must come from a registered laptop. */
  async requireDevice(id: string | undefined): Promise<string> {
    if (!id || !UUID.test(id) || !(await this.repo.findById(id))) {
      throw new BadRequestException('Unknown device. Register this laptop first.');
    }
    await this.repo.touch(id);
    return id;
  }
}
