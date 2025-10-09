import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { FastifyReply } from 'fastify';
import { AuditLogService } from 'src/audit-log/audit-log.service';
import { AuditLogEntry } from 'src/audit-log/audit-log.type';
import { CountDto, IdDto } from 'src/common/dto/common.dto';
import configuration from 'src/config/configuration';
import { DatabaseService } from 'src/database/database.service';
import { SseEmitterService } from 'src/events/sse/sse.service';
import { JwtTokenService } from 'src/jwt-token/jwt-token.service';
import { CustomLogger } from 'src/logger/custom-logger.service';
import { RedisCacheService } from 'src/redis-cache/redis-cache.service';
import * as K from 'src/common/constants';
import { UserPermissionsDto } from 'src/common/dto/user-permission.dto';
import {
  CheckInitializationStatusResponse,
  InitializeSuperAdminDto,
  InitializeSuperAdminResponseDto,
  LoginRequestDto,
  LoginResponseDto,
  PayloadDto,
  RefreshTokenResponseDto,
  UserInfoDto,
} from './dto';
import {
  CREATE_SUPERADMIN_QUERY,
  FETCH_USER_BY_USERNAME_QUERY,
  GET_SUPERADMIN_PERMISSION_QUERY,
  LOG_USER_LOGIN_QUERY,
  USER_COUNT_QUERY,
} from './queries';

@Injectable()
export class AuthService {
  constructor(
    @Inject(configuration.KEY)
    private readonly config: ConfigType<typeof configuration>,
    private readonly db: DatabaseService<any>,
    private readonly auditService: AuditLogService,
    private readonly jwt: JwtTokenService,
    private readonly redis: RedisCacheService,
    private readonly sseEmitter: SseEmitterService,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(AuthService.name);
  }

  private readonly isBootstrapped = (): boolean =>
    existsSync(K.SETUP_LOCK_FILE);
  private readonly isValidPassword = (password: string): boolean =>
    (typeof K.STRONG_PASSWORD === 'string'
      ? new RegExp(K.STRONG_PASSWORD)
      : K.STRONG_PASSWORD
    ).test(password);
  private readonly hashPassword = (password: string): Promise<string> =>
    bcrypt.hash(password, K.PASSWORD_HASH_ROUNDS);
  private readonly verifyPassword = (
    password: string,
    hash: string,
  ): Promise<boolean> => bcrypt.compare(password, hash);

  private async executeQuery<T>(
    query: string,
    params: any[],
    dto: any,
  ): Promise<T[]> {
    const result = (await this.db.rawQuery(query, params, dto)) as T[];
    if (!Array.isArray(result) || !result[0])
      throw new BadRequestException('Database query failed');
    return result;
  }

  private async getUserCount(): Promise<number> {
    return (
      await this.executeQuery<CountDto>(USER_COUNT_QUERY, [], CountDto)
    )[0].count;
  }

  private async generateAuthTokens(data: PayloadDto) {
    const tokens = await this.jwt.generateTokens(data);
    await this.redis.set(
      data.loginId,
      tokens,
      this.config.jwt.refreshExpiry as string | number,
    );
    return tokens;
  }

  private setRefreshTokenCookie(reply: FastifyReply, token: string): void {
    reply.setCookie('refreshToken', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/v1/auth/refresh-token',
      maxAge: +(this.config.jwt.refreshExpiry as string),
    });
  }

  private createBootstrapFile(): void {
    mkdirSync(dirname(K.SETUP_LOCK_FILE), { recursive: true });
    writeFileSync(
      K.SETUP_LOCK_FILE,
      `Bootstrapped at ${new Date().toISOString()}\n`,
    );
  }

  async checkInitializationStatus(): Promise<CheckInitializationStatusResponse> {
    const initialized =
      this.isBootstrapped() || (await this.getUserCount()) > 0;
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: initialized
        ? 'Application has been initialized.'
        : 'Application initialization status retrieved successfully.',
      data: { initialized },
    };
  }

  async initializeSuperAdmin(
    dto: InitializeSuperAdminDto,
    reply: FastifyReply,
  ): Promise<InitializeSuperAdminResponseDto> {
    if (this.isBootstrapped())
      throw new BadRequestException('System already bootstrapped');
    if ((await this.getUserCount()) > 0)
      throw new BadRequestException('Super Admin already exists');
    if (!this.isValidPassword(dto.password))
      throw new BadRequestException(
        'Password does not meet strength requirements',
      );

    const { fullname, username, password } = dto;
    const hashedPassword = await this.hashPassword(password);

    const [createdUser, permissions] = await Promise.all([
      this.executeQuery<IdDto>(
        CREATE_SUPERADMIN_QUERY,
        [fullname, username, hashedPassword],
        IdDto,
      ),
      this.db.rawQuery(
        GET_SUPERADMIN_PERMISSION_QUERY,
        [],
        UserPermissionsDto,
      ) as Promise<UserPermissionsDto[]>,
    ]);

    const userId = String(createdUser[0].id);
    const login = await this.executeQuery<IdDto>(
      LOG_USER_LOGIN_QUERY,
      [userId],
      IdDto,
    );
    const loginId = String(login[0].id);

    await this.auditService.logAction({
      userId,
      action: 'CREATE_SUPERADMIN',
      entityId: userId,
      entityType: 'User',
      details: {
        username,
        fullname,
        description: `Super Admin "${username}" created.`,
        timestamp: new Date().toISOString(),
      },
    } as AuditLogEntry);

    this.createBootstrapFile();
    this.sseEmitter.emitToAll('superadmin.created', {
      initialized: this.isBootstrapped(),
    });

    const { accessToken, refreshToken } = await this.generateAuthTokens({
      loginId,
      userId,
      name: fullname,
      role: 'superadmin',
    });
    this.setRefreshTokenCookie(reply, refreshToken);

    return {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: 'System bootstrapped with Super Admin successfully.',
      data: {
        accessToken,
        permissions: permissions?.[0] ?? ({} as UserPermissionsDto),
      },
    };
  }

  async userLogin(
    credentials: LoginRequestDto,
    reply: FastifyReply,
  ): Promise<LoginResponseDto> {
    const { username, password } = {
      username: credentials.username.trim(),
      password: credentials.password.trim(),
    };
    const users = (await this.db.rawQuery(
      FETCH_USER_BY_USERNAME_QUERY,
      [username],
      UserInfoDto,
    )) as UserInfoDto[];
    const user = users?.[0];

    if (!user || !(await this.verifyPassword(password, user.passwordHash))) {
      this.logger.warn(`Login failed for user: ${username}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const loginRecords = await this.executeQuery<IdDto>(
      LOG_USER_LOGIN_QUERY,
      [user.id],
      IdDto,
    );
    const { accessToken, refreshToken } = await this.generateAuthTokens({
      loginId: String(loginRecords[0].id),
      userId: String(user.id),
      name: user.fullname,
      role: user.role,
    });

    this.setRefreshTokenCookie(reply, refreshToken);
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Login successful',
      data: { accessToken, permissions: user.permissions },
    };
  }

  async refreshAccessToken(
    token: string,
    reply: FastifyReply,
  ): Promise<RefreshTokenResponseDto> {
    if (!token) throw new UnauthorizedException('Missing refresh token');

    try {
      const payload = (await this.jwt.verifyToken(
        token,
        this.config.jwt.refreshSecret as string,
      )) as PayloadDto;
      const cache = (await this.redis.get(payload.loginId)) as {
        accessToken: string;
        refreshToken: string;
      } | null;
      if (!cache)
        throw new BadRequestException('Invalid or expired refresh token');

      const { accessToken, refreshToken } = await this.jwt.generateTokens({
        loginId: payload.loginId,
        userId: payload.userId,
        name: payload.name ?? '',
        role: payload.role ?? '',
      });

      await this.redis.set(
        payload.loginId,
        { accessToken, refreshToken },
        this.config.redis.ttl as string,
      );
      this.setRefreshTokenCookie(reply, refreshToken);

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Token refreshed successfully',
        data: { accessToken },
      };
    } catch (error) {
      this.logger.error('Token refresh failed', error);
      throw new UnauthorizedException('Token refresh failed');
    }
  }

  async logout(loginId: string, reply: FastifyReply): Promise<void> {
    await Promise.all([
      this.db.update({
        table: 'user_login',
        set: 'logout_at = CURRENT_TIMESTAMP',
        where: 'id = $1',
        variables: [loginId],
      }),
      this.redis.del(loginId),
    ]);
    await reply.clearCookie('refreshToken', { path: '/v1/auth/refresh-token' });
  }
}
