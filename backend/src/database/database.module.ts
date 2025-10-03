import { Module } from '@nestjs/common';
import { CustomLoggerModule } from '../logger/custom-logger.module';
import { UtilsModule } from 'src/common/utils/utils.module';
import { pgConnectionFactory } from './database.provider';
import { DatabaseService } from './database.service';

@Module({
  imports: [CustomLoggerModule, UtilsModule],
  providers: [pgConnectionFactory, DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
