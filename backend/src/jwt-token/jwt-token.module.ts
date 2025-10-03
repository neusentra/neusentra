import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JWT_ALGORITHM } from 'src/common/constants';
import configuration from 'src/config/configuration';
import { CustomLoggerModule } from 'src/logger/custom-logger.module';
import { RedisCacheModule } from 'src/redis-cache/redis-cache.module';
import { JwtTokenService } from './jwt-token.service';
import { JwtStrategy } from './jwt/jwt.strategy';
import { JwtRefreshStrategy } from './jwt/jwt-refresh.strategy';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigType<typeof configuration>) => ({
        secret: config.jwt.secret,
        signOptions: {
          expiresIn: config.jwt.expiry,
          algorithm: JWT_ALGORITHM,
        },
      }),
      inject: [configuration.KEY],
    }),
    PassportModule,
    CustomLoggerModule,
    RedisCacheModule,
  ],
  providers: [JwtTokenService, JwtStrategy, JwtRefreshStrategy],
  exports: [JwtTokenService, JwtModule],
})
export class JwtTokenModule {}
