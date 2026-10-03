import { Module } from '@nestjs/common';
import { registerSyncTables, SyncModule } from '../sync';
import { auditSync } from './audit.sync';

@Module({ imports: [SyncModule], providers: [registerSyncTables(auditSync)] })
export class AuditModule {}
