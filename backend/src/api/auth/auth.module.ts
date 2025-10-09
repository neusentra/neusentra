import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CommonModule } from 'src/common/common.module';
import { JwtTokenModule } from 'src/jwt-token/jwt-token.module';
import { RedisCacheModule } from 'src/redis-cache/redis-cache.module';
import { SseModule } from 'src/events/sse/sse.module';

@Module({
  imports: [
    CommonModule,
    JwtTokenModule,
    RedisCacheModule,
    SseModule,
  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
