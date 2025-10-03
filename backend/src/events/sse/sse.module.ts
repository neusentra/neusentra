import { Module } from '@nestjs/common';
import { SseController } from './sse.controller';
import { SseEmitterService } from './sse.service';
import { CustomLoggerModule } from 'src/logger/custom-logger.module';
import { SseGateway } from './sse.gateway';

@Module({
  imports: [CustomLoggerModule],
  controllers: [SseController],
  providers: [SseEmitterService, SseGateway],
  exports: [SseEmitterService],
})
export class SseModule {}
