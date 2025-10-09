import { Test, TestingModule } from '@nestjs/testing';
import { JwtTokenService } from './jwt-token.service';
import { JwtService } from '@nestjs/jwt';
import configuration from 'src/config/configuration';
import { CustomLogger } from 'src/logger/custom-logger.service';
import { TokenPayload } from './interfaces/token-payload.interface';

describe('JwtTokenService', () => {
  let service: JwtTokenService;
  let jwtServiceMock: Partial<JwtService>;
  let loggerMock: Partial<CustomLogger>;
  const mockConfig = {
    jwt: {
      refreshSecret: 'refresh-secret',
      refreshExpiry: '7d',
    },
  };

  beforeEach(async () => {
    jwtServiceMock = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };

    loggerMock = {
      setContext: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtTokenService,
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: configuration.KEY, useValue: mockConfig },
        { provide: CustomLogger, useValue: loggerMock },
      ],
    }).compile();

    service = module.get<JwtTokenService>(JwtTokenService);
  });

  it('should set logger context on construction', () => {
    expect(loggerMock.setContext).toHaveBeenCalledWith('JwtTokenService');
  });

  describe('generateTokens', () => {
    const payload: TokenPayload = {
      loginId: 'login123',
      userId: 'user123',
      name: 'John Doe',
      role: 'admin',
    };

    it('should generate access and refresh tokens', async () => {
      (jwtServiceMock.signAsync as jest.Mock)
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const tokens = await service.generateTokens(payload);

      expect(jwtServiceMock.signAsync).toHaveBeenCalledTimes(2);
      expect(jwtServiceMock.signAsync).toHaveBeenNthCalledWith(1, payload);
      expect(jwtServiceMock.signAsync).toHaveBeenNthCalledWith(
        2,
        payload,
        {
          secret: mockConfig.jwt.refreshSecret,
          expiresIn: mockConfig.jwt.refreshExpiry,
        },
      );
      expect(tokens).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token' });
    });

    it('should log and rethrow error on sign failure', async () => {
      const error = new Error('sign failed');
      (jwtServiceMock.signAsync as jest.Mock).mockRejectedValue(error);

      await expect(service.generateTokens(payload)).rejects.toThrow(error);
      expect(loggerMock.error).toHaveBeenCalledWith(error);
    });
  });

  describe('verifyToken', () => {
    it('should call jwtService.verifyAsync with token and secret', async () => {
      const token = 'token';
      const secret = 'secret-key';
      (jwtServiceMock.verifyAsync as jest.Mock).mockResolvedValue({ userId: 'user123' });

      const result = await service.verifyToken(token, secret);

      expect(jwtServiceMock.verifyAsync).toHaveBeenCalledWith(token, { secret });
      expect(result).toEqual({ userId: 'user123' });
    });
  });
});
