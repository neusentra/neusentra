import { Module } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { DatabaseModule } from 'src/database/database.module';
import { CustomLoggerModule } from 'src/logger/custom-logger.module';

@Module({
  imports: [DatabaseModule, CustomLoggerModule],
  providers: [AuditLogService],
  exports: [AuditLogService],
})
export class AuditLogModule {}
