import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {
  InitializeSuperAdminDto,
  InitializeSuperAdminResponseDto,
} from './dto/initialize-superadmin.dto';
import { LoginRequestDto, LoginResponseDto } from './dto/auth.dto';
import { CheckInitializationStatusResponse } from './dto/check-initialization.dto';
import { FastifyReply } from 'fastify';

describe('AuthController', () => {
  let controller: AuthController;
  let service: Partial<AuthService>;
  let reply: Partial<FastifyReply>;

  beforeEach(async () => {
    service = {
      checkInitializationStatus: jest.fn(),
      initializeSuperAdmin: jest.fn(),
      userLogin: jest.fn(),
      refreshAccessToken: jest.fn(),
      logout: jest.fn(),
    };
    reply = {
      setCookie: jest.fn(),
      clearCookie: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: service }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('checkStatus', () => {
    it('calls authService.checkInitializationStatus and returns its result', async () => {
      const result: CheckInitializationStatusResponse = {
        success: true,
        statusCode: 200,
        message: 'OK',
        data: { initialized: true },
      };
      (service.checkInitializationStatus as jest.Mock).mockResolvedValue(
        result,
      );

      await expect(controller.checkStatus()).resolves.toBe(result);
      expect(service.checkInitializationStatus).toHaveBeenCalled();
    });
  });

  describe('initialize', () => {
    it('calls authService.initializeSuperAdmin and returns its result', async () => {
      const dto: InitializeSuperAdminDto = {
        fullname: 'Admin',
        username: 'admin',
        password: 'pass',
      };
      const result: InitializeSuperAdminResponseDto = {
        success: true,
        statusCode: 201,
        message: 'Created',
        data: { accessToken: 'token', permissions: {} },
      };
      (service.initializeSuperAdmin as jest.Mock).mockResolvedValue(result);

      await expect(
        controller.initialize(dto, reply as FastifyReply),
      ).resolves.toBe(result);
      expect(service.initializeSuperAdmin).toHaveBeenCalledWith(dto, reply);
    });
  });

  describe('login', () => {
    it('calls authService.userLogin and returns its result', async () => {
      const dto: LoginRequestDto = { username: 'user', password: 'pass' };
      const result: LoginResponseDto = {
        success: true,
        statusCode: 200,
        message: 'OK',
        data: { accessToken: 'token', permissions: {} },
      };
      (service.userLogin as jest.Mock).mockResolvedValue(result);

      await expect(controller.login(dto, reply as FastifyReply)).resolves.toBe(
        result,
      );
      expect(service.userLogin).toHaveBeenCalledWith(dto, reply);
    });
  });

  describe('refreshToken', () => {
    it('calls authService.refreshAccessToken with cookie and reply', async () => {
      (service.refreshAccessToken as jest.Mock).mockResolvedValue(undefined);

      // simulate decorator extracting cookie
      const token = 'refresh-token';
      await expect(
        controller.refreshToken(token, reply as FastifyReply),
      ).resolves.toBeUndefined();
      expect(service.refreshAccessToken).toHaveBeenCalledWith(token, reply);
    });
  });

  describe('logout', () => {
    it('calls authService.logout with loginId and reply', async () => {
      (service.logout as jest.Mock).mockResolvedValue(undefined);

      const loginId = 'login-id';
      await expect(
        controller.logout(loginId, reply as FastifyReply),
      ).resolves.toBeUndefined();
      expect(service.logout).toHaveBeenCalledWith(loginId, reply);
    });
  });
});
