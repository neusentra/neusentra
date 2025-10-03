import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisCacheService } from './redis-cache.service';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const store = await redisStore({
          socket: {
            host: configService.get('config.redis.host'),
            port: parseInt(configService.get('config.redis.port') || '6379'),
            tls: false,
          },
          ttl: configService.get('config.redis.ttl'),
        });

        return {
          store,
          ttl: configService.get('config.redis.ttl'),
        };
      },
      inject: [ConfigService],
    }),
    CommonModule,
  ],
  providers: [RedisCacheService],
  exports: [RedisCacheService],
})
export class RedisCacheModule {}
