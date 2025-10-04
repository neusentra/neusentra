import { BadRequestException, HttpStatus, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname } from 'path';
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
import { CREATE_SUPERADMIN_QUERY, GET_SUPERADMIN_PERMISSION_QUERY, USER_COUNT_QUERY } from './queries/initialization.query';
import { CheckInitializationStatusResponse } from './dto/check-initialization.dto';
import { InitializeSuperAdminDto, InitializeSuperAdminResponseDto } from './dto/initialize-superadmin.dto';
import { LOG_USER_LOGIN_QUERY } from './queries/log-user-login.query';
import { LoginRequestDto, LoginResponseDto, UserInfoDto } from './dto/auth.dto';
import { FETCH_USER_BY_USERNAME_QUERY } from './queries/user-login.query';
import { TokenPayload } from 'src/jwt-token/interfaces/token-payload.interface';

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

    private isBootstrapped(): boolean {
        return existsSync(K.SETUP_LOCK_FILE);
    }

    private isValidPassword(password: string): boolean {
        return RegExp(K.STRONG_PASSWORD).test(password);
    }

    private async getAuthToken(data: { loginId: string, userId: string, name: string, role: string }) {
        const { accessToken, refreshToken } = await this.jwt.generateTokens(data);

        await this.redis.set(
            data.loginId,
            { accessToken, refreshToken: refreshToken },
            this.config.jwt.refreshExpiry as string | number,
        );

        return { accessToken };
    }

    async checkInitializationStatus(): Promise<CheckInitializationStatusResponse> {
        if (this.isBootstrapped()) {
            return {
                success: true,
                statusCode: HttpStatus.OK,
                message: 'Application has been initialized.',
                data: { initialized: true },
            };
        }

        const result = await this.db.rawQuery(USER_COUNT_QUERY, [], CountDto);
        return {
            success: true,
            statusCode: HttpStatus.OK,
            message: 'Application initialization status retrieved successfully.',
            data: { initialized: result[0].count > 0 },
        };
    }

    async initializeSuperAdmin(
        dto: InitializeSuperAdminDto,
    ): Promise<InitializeSuperAdminResponseDto> {
        if (this.isBootstrapped()) {
            throw new BadRequestException('System has already been bootstrapped.');
        }

        const userCount = (await this.db.rawQuery(USER_COUNT_QUERY, [], CountDto))[0].count;

        if (userCount > 0) {
            throw new BadRequestException('Super Admin already exists.');
        }

        const { fullname, username, password } = dto;

        if (!(this.isValidPassword(password))) {
            throw new BadRequestException('Password does not meet strength requirements.');
        }

        const hashedPassword = await bcrypt.hash(password, K.PASSWORD_HASH_ROUNDS);

        const createdUser = await this.db.rawQuery(
            CREATE_SUPERADMIN_QUERY,
            [fullname, username, hashedPassword],
            IdDto,
        );
        const userId = createdUser[0].id;

        const loginRecord = await this.db.rawQuery(LOG_USER_LOGIN_QUERY, [userId], IdDto);
        const loginId = loginRecord[0].id;

        const permissions = (
            await this.db.rawQuery(GET_SUPERADMIN_PERMISSION_QUERY, [], UserPermissionsDto)
        )[0].permissions;

        await this.auditService.logAction(<AuditLogEntry>{
            userId,
            action: 'CREATE_SUPERADMIN',
            entityId: userId,
            entityType: 'User',
            details: {
                username,
                fullname: createdUser[0].fullname,
                description: `Super Admin "${username}" created.`,
                timestamp: new Date().toISOString(),
            },
        });

        mkdirSync(dirname(K.SETUP_LOCK_FILE), { recursive: true });
        writeFileSync(K.SETUP_LOCK_FILE, `Bootstrapped at ${new Date().toISOString()}\n`);

        this.sseEmitter.emitToAll('superadmin.created', null);

        const { accessToken } = await this.getAuthToken({
            loginId,
            userId,
            name: createdUser[0].fullname,
            role: 'superadmin',
        });


        return {
            success: true,
            statusCode: HttpStatus.CREATED,
            message: 'System bootstrapped with Super Admin successfully.',
            data: {
                accessToken,
                permissions,
            },
        };
    }

    async userLogin(credentials: LoginRequestDto): Promise<LoginResponseDto> { 
        const username = credentials.username.trim();
        const password = credentials.password.trim();

        const users = await this.db.rawQuery(
            FETCH_USER_BY_USERNAME_QUERY,
            [username],
            UserInfoDto
        );

        const user = users?.[0];

        if (!user) {
            this.logger.warn(`Login failed: User "${username}" not found.`);
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            this.logger.warn(
                `Login failed: Incorrect password for user "${username}".`,
            );
            throw new UnauthorizedException('Invalid credentials');
        }

        const loginRecords = await this.db.rawQuery(
            LOG_USER_LOGIN_QUERY,
            [user.id],
            IdDto,
        );

        const { accessToken } = await this.getAuthToken({
            loginId: loginRecords[0].id,
            userId: user.id,
            name: user.fullname,
            role: user.role,
        });

        return {
            success: true,
            statusCode: HttpStatus.OK,
            message: 'Login successful',
            data: {
                accessToken,
                permissions: user.permissions,
            },
        };
    }

    async logout(loginId: string): Promise<void> {
        await this.db.update({
            table: 'user_login',
            set: `logout_at = CURRENT_TIMESTAMP`,
            where: `id = $1`,
            variables: [loginId],
        }, IdDto);

        return this.redis.del(loginId);
    }
}