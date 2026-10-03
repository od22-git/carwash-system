import { Module } from '@nestjs/common';
import { DevicesModule } from '../devices/devices.module';
import { SyncRegistry } from './sync-registry';
import { SyncController } from './sync.controller';
import { SyncRepository } from './sync.repository';
import { SyncService } from './sync.service';

@Module({
  imports: [DevicesModule],
  controllers: [SyncController],
  providers: [SyncRegistry, SyncRepository, SyncService],
  exports: [SyncRegistry],
})
export class SyncModule {}
