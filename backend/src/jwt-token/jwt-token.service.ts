import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import configuration from 'src/config/configuration';
import { CustomLogger } from 'src/logger/custom-logger.service';
import { TokenPayload } from './interfaces/token-payload.interface';
import { TokenDto } from 'src/common/dto/token.dto';

@Injectable()
export class JwtTokenService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(configuration.KEY)
    private readonly config: ConfigType<typeof configuration>,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(JwtTokenService.name);
  }

  /**
   * Method to generate an access token and a refresh token.
   * @param {string} loginId Member ID of the user.
   * @param {string} userId Member ID of the user.
   * @param {string} name of the user.
   * @param {string} role of the user.
   * @returns {Promise<TokenDto>} Access token and refresh token.
   */
  async generateTokens({
    loginId,
    userId,
    name,
    role,
  }: TokenPayload): Promise<TokenDto> {
    try {
      this.logger.log('JWT expiry:', this.config.jwt.expiry);
      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync({
          loginId,
          userId,
          name,
          role,
        }),
        this.jwtService.signAsync(
          {
            loginId,
            userId,
            name,
            role,
          },
          {
            secret: this.config.jwt.refreshSecret,
            expiresIn: this.config.jwt.refreshExpiry,
          },
        ),
      ]);

      return { accessToken, refreshToken };
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}
