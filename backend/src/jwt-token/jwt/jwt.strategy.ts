import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CustomLogger } from 'src/logger/custom-logger.service';
import * as K from 'src/common/constants';
import { RedisCacheService } from 'src/redis-cache/redis-cache.service';
import { TokenPayload } from '../interfaces/token-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
  K.JWT_STRATEGY.DEFAULT,
) {
  constructor(
    private readonly logger: CustomLogger,
    private readonly redisService: RedisCacheService,
  ) {
    logger.setContext(JwtStrategy.name);
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: TokenPayload): Promise<TokenPayload> {
    try {
      const accessTokenFromHeader = req?.headers?.authorization
        ?.replace('Bearer', '')
        .trim();
      if (!accessTokenFromHeader) {
        throw new UnauthorizedException(K.ERROR_CODES.INVALID_ACCESS_TOKEN);
      }

      const { loginId } = payload;
      if (!loginId) {
        throw new UnauthorizedException(K.ERROR_CODES.INVALID_ACCESS_TOKEN);
      }

      const isValidUser = await this.redisService.get(loginId);

      if (!isValidUser) {
        throw new UnauthorizedException(K.ERROR_CODES.INVALID_ACCESS_TOKEN);
      }

      return payload;
    } catch (error) {
      this.logger.error('Token error: ', error);
      throw error;
    }
  }
}
