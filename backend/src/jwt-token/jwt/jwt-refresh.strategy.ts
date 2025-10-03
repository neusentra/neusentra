import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as K from 'src/common/constants';
import {
  RefreshTokenPayload,
  TokenPayload,
} from '../interfaces/token-payload.interface';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  K.JWT_STRATEGY.REFRESH,
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET,
      passReqtoCallback: true,
    });
  }

  validate(req: any, payload: TokenPayload): RefreshTokenPayload {
    const refresh_token = req?.headers?.authorization
      ?.replace('Bearer', '')
      .trim();
    if (!refresh_token) {
      throw new UnauthorizedException(K.ERROR_CODES.INVALID_REFRESH_TOKEN);
    }

    return { ...payload, refresh_token };
  }
}
