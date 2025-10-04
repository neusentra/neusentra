import { Module } from '@nestjs/common';
import { AuditLogModule } from 'src/audit-log/audit-log.module';
import { DatabaseModule } from 'src/database/database.module';
import { CustomLoggerModule } from 'src/logger/custom-logger.module';

const commonModules = [
  DatabaseModule,
  AuditLogModule,
  CustomLoggerModule,
];

@Module({
  imports: commonModules,
  exports: commonModules,
})
export class CommonModule {}
