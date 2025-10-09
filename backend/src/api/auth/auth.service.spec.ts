import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { DatabaseService } from 'src/database/database.service';
import { AuditLogService } from 'src/audit-log/audit-log.service';
import { JwtTokenService } from 'src/jwt-token/jwt-token.service';
import { RedisCacheService } from 'src/redis-cache/redis-cache.service';
import { SseEmitterService } from 'src/events/sse/sse.service';
import { CustomLogger } from 'src/logger/custom-logger.service';
import {
  BadRequestException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import configuration from 'src/config/configuration';
import {
  CREATE_SUPERADMIN_QUERY,
  FETCH_USER_BY_USERNAME_QUERY,
  GET_SUPERADMIN_PERMISSION_QUERY,
  LOG_USER_LOGIN_QUERY,
} from './queries';

describe('AuthService', () => {
  let service: AuthService;
  let dbMock: Partial<DatabaseService<any>>;
  let jwtMock: Partial<JwtTokenService>;
  let redisMock: Partial<RedisCacheService>;
  let reply: Partial<FastifyReply>;

  beforeEach(async () => {
    dbMock = { rawQuery: jest.fn(), update: jest.fn() };
    jwtMock = { generateTokens: jest.fn(), verifyToken: jest.fn() };
    redisMock = { get: jest.fn(), set: jest.fn(), del: jest.fn() };
    const auditMock = { logAction: jest.fn() };
    const sseMock = { emitToAll: jest.fn() };
    const loggerMock = {
      setContext: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };
    const configMock = {
      ...configuration(),
      jwt: { refreshExpiry: 86400, refreshSecret: 'secret' },
      redis: { ttl: 86400 },
    } as any;
    reply = { setCookie: jest.fn(), clearCookie: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: DatabaseService, useValue: dbMock },
        { provide: AuditLogService, useValue: auditMock },
        { provide: JwtTokenService, useValue: jwtMock },
        { provide: RedisCacheService, useValue: redisMock },
        { provide: SseEmitterService, useValue: sseMock },
        { provide: CustomLogger, useValue: loggerMock },
        { provide: configuration.KEY, useValue: configMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('checkInitializationStatus', () => {
    it('returns initialized true when already bootstrapped', async () => {
      jest.spyOn(service as any, 'isBootstrapped').mockReturnValue(true);
      const res = await service.checkInitializationStatus();
      expect(res.data.initialized).toBe(true);
      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.success).toBe(true);
    });

    it('returns initialized false when not bootstrapped and no users', async () => {
      jest.spyOn(service as any, 'isBootstrapped').mockReturnValue(false);
      jest.spyOn(service as any, 'getUserCount').mockResolvedValue(0);
      const res = await service.checkInitializationStatus();
      expect(res.data.initialized).toBe(false);
      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.success).toBe(true);
    });
  });

  describe('initializeSuperAdmin', () => {
    const dto = {
      fullname: 'Admin',
      username: 'admin',
      password: 'StrongPass1!',
    };

    beforeEach(() => {
      // Setup bootstrap and count stubs
      jest.spyOn(service as any, 'isBootstrapped').mockReturnValue(false);
      jest.spyOn(service as any, 'getUserCount').mockResolvedValue(0);
      jest.spyOn(service as any, 'isValidPassword').mockReturnValue(true);
      jest.spyOn(service as any, 'hashPassword').mockResolvedValue('hashed');

      // Stub rawQuery for CREATE and LOGIN and PERMISSIONS
      (dbMock.rawQuery as jest.Mock).mockImplementation((query: string) => {
        if (query === CREATE_SUPERADMIN_QUERY) {
          return Promise.resolve([{ id: 'user-id' }]);
        }
        if (query === LOG_USER_LOGIN_QUERY) {
          return Promise.resolve([{ id: 'login-id' }]);
        }
        if (query === GET_SUPERADMIN_PERMISSION_QUERY) {
          return Promise.resolve([{ perm: true }]);
        }
        return Promise.resolve([]);
      });

      // Tokens & cache stubs
      jwtMock.generateTokens = jest
        .fn()
        .mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh' });
      (redisMock.set as jest.Mock).mockResolvedValue(null);
    });

    it('throws when system already bootstrapped', async () => {
      jest.spyOn(service as any, 'isBootstrapped').mockReturnValue(true);
      await expect(
        service.initializeSuperAdmin(dto, reply as FastifyReply),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.initializeSuperAdmin(dto, reply as FastifyReply),
      ).rejects.toThrow('System already bootstrapped');
    });

    it('throws when super admin already exists', async () => {
      jest.spyOn(service as any, 'isBootstrapped').mockReturnValue(false);
      jest.spyOn(service as any, 'getUserCount').mockResolvedValue(1);
      const call = service.initializeSuperAdmin(dto, reply as FastifyReply);
      await expect(call).rejects.toThrow(BadRequestException);
      await expect(call).rejects.toThrow('Super Admin already exists');
    });

    it('throws when password strength fails', async () => {
      jest.spyOn(service as any, 'isBootstrapped').mockReturnValue(false);
      jest.spyOn(service as any, 'getUserCount').mockResolvedValue(0);
      jest.spyOn(service as any, 'isValidPassword').mockReturnValue(false);
      const call = service.initializeSuperAdmin(dto, reply as FastifyReply);
      await expect(call).rejects.toThrow(BadRequestException);
      await expect(call).rejects.toThrow(
        'Password does not meet strength requirements',
      );
    });

    it('successfully initializes superadmin', async () => {
      const result = await service.initializeSuperAdmin(
        dto,
        reply as FastifyReply,
      );
      expect(result.success).toBe(true);
      expect(reply.setCookie).toHaveBeenCalledWith(
        'refreshToken',
        'refresh',
        expect.any(Object),
      );
      expect(redisMock.set).toHaveBeenCalled();
    });
  });

  describe('userLogin', () => {
    const credentials = { username: 'user', password: 'pass' };

    beforeEach(() => {
      // Stub rawQuery for fetching user and creating login record
      (dbMock.rawQuery as jest.Mock).mockImplementation((query: string) => {
        if (query === FETCH_USER_BY_USERNAME_QUERY) {
          return Promise.resolve([
            {
              id: 'user-id',
              fullname: 'User',
              passwordHash: 'hashed',
              role: 'role',
              permissions: {},
            },
          ]);
        }
        if (query === LOG_USER_LOGIN_QUERY) {
          return Promise.resolve([{ id: 'login-id' }]);
        }
        return Promise.resolve([]);
      });

      // Always succeed password verification
      jest.spyOn(service as any, 'verifyPassword').mockResolvedValue(true);

      // Stub token generation
      jwtMock.generateTokens = jest
        .fn()
        .mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh' });
    });

    it('throws when no user is found', async () => {
      // rawQuery returns empty array
      (dbMock.rawQuery as jest.Mock).mockResolvedValueOnce([]);
      const call = service.userLogin(credentials, reply as FastifyReply);
      await expect(call).rejects.toThrow(UnauthorizedException);
      await expect(call).rejects.toThrow('Invalid credentials');
    });

    it('throws when password verification fails', async () => {
      // rawQuery returns a user
      (dbMock.rawQuery as jest.Mock).mockResolvedValueOnce([
        {
          id: 'user-id',
          fullname: 'User',
          passwordHash: 'hashed',
          role: 'role',
          permissions: {},
        },
      ]);
      jest.spyOn(service as any, 'verifyPassword').mockResolvedValueOnce(false);
      const call = service.userLogin(credentials, reply as FastifyReply);
      await expect(call).rejects.toThrow(UnauthorizedException);
      await expect(call).rejects.toThrow('Invalid credentials');
    });

    it('successfully logs in', async () => {
      const result = await service.userLogin(
        credentials,
        reply as FastifyReply,
      );
      expect(result.success).toBe(true);
      expect(reply.setCookie).toHaveBeenCalledWith(
        'refreshToken',
        'refresh',
        expect.any(Object),
      );
      expect(jwtMock.generateTokens).toHaveBeenCalledWith({
        loginId: 'login-id',
        userId: 'user-id',
        name: 'User',
        role: 'role',
      });
    });
  });

  describe('refreshAccessToken', () => {
    beforeEach(() => {
      jwtMock.verifyToken = jest.fn();
      jwtMock.generateTokens = jest.fn();
      redisMock.get = jest.fn();
      redisMock.set = jest.fn();
    });

    it('throws when token is missing', async () => {
      const call = service.refreshAccessToken('', reply as FastifyReply);
      await expect(call).rejects.toThrow(UnauthorizedException);
      await expect(call).rejects.toThrow('Missing refresh token');
    });

    it('throws when verifyToken fails', async () => {
      (jwtMock.verifyToken as jest.Mock).mockRejectedValueOnce(
        new Error('invalid'),
      );
      const call = service.refreshAccessToken(
        'bad-token',
        reply as FastifyReply,
      );
      await expect(call).rejects.toThrow(UnauthorizedException);
      await expect(call).rejects.toThrow('Token refresh failed');
    });

    it('throws if cache missing', async () => {
      jwtMock.verifyToken = jest
        .fn()
        .mockResolvedValue({ loginId: 'id', userId: 'id' });
      (redisMock.get as jest.Mock).mockResolvedValue(null);
      await expect(
        service.refreshAccessToken('token', reply as FastifyReply),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('successfully refreshes token', async () => {
      jwtMock.verifyToken = jest.fn().mockResolvedValue({
        loginId: 'id',
        userId: 'id',
        name: '',
        role: '',
      });
      (redisMock.get as jest.Mock).mockResolvedValue({
        accessToken: 'old',
        refreshToken: 'old',
      });
      jwtMock.generateTokens = jest.fn().mockResolvedValue({
        accessToken: 'new',
        refreshToken: 'new',
      });
      (redisMock.set as jest.Mock).mockResolvedValue(null);

      const result = await service.refreshAccessToken(
        'token',
        reply as FastifyReply,
      );
      expect(result.success).toBe(true);
      expect(reply.setCookie).toHaveBeenCalledWith(
        'refreshToken',
        'new',
        expect.any(Object),
      );
    });
  });

  describe('logout', () => {
    it('clears session and cookie', async () => {
      (dbMock.update as jest.Mock).mockResolvedValue(undefined);
      (redisMock.del as jest.Mock).mockResolvedValue(undefined);

      await service.logout('loginId', reply as FastifyReply);
      expect(dbMock.update).toHaveBeenCalledWith({
        table: 'user_login',
        set: 'logout_at = CURRENT_TIMESTAMP',
        where: 'id = $1',
        variables: ['loginId'],
      });
      expect(redisMock.del).toHaveBeenCalledWith('loginId');
      expect(reply.clearCookie).toHaveBeenCalledWith('refreshToken', {
        path: '/v1/auth/refresh-token',
      });
    });
  });

  describe('executeQuery', () => {
    it('throws when database query returns empty result', async () => {
      (dbMock.rawQuery as jest.Mock).mockResolvedValueOnce([]);
      const call = (service as any).executeQuery(
        'SELECT * FROM test',
        [],
        Object,
      );
      await expect(call).rejects.toThrow(BadRequestException);
      await expect(call).rejects.toThrow('Database query failed');
    });

    it('throws when database query returns null', async () => {
      (dbMock.rawQuery as jest.Mock).mockResolvedValueOnce(null);
      const call = (service as any).executeQuery(
        'SELECT * FROM test',
        [],
        Object,
      );
      await expect(call).rejects.toThrow(BadRequestException);
      await expect(call).rejects.toThrow('Database query failed');
    });
  });
});
