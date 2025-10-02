import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { CustomLoggerModule } from 'src/logger/custom-logger.module';

const commonModules = [DatabaseModule, CustomLoggerModule];

@Module({
  imports: commonModules,
  exports: commonModules,
})
export class CommonModule {}
