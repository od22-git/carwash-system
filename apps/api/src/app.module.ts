import { Module } from '@nestjs/common';
import { ConfigModule } from './config';
import { DatabaseModule } from './database';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [ConfigModule, DatabaseModule, HealthModule],
})
export class AppModule {}
