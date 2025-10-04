import { AuthGuard } from '@nestjs/passport';
import {
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt';
import { RedisCacheService } from 'src/redis-cache/redis-cache.service';
import * as K from 'src/common/constants';

@Injectable()
export class NeuSentraAuthGuard extends AuthGuard(K.JWT_STRATEGY.DEFAULT) {
    constructor(private readonly redisCache: RedisCacheService) {
        super();
    }

    async canActivate(context: ExecutionContext) {
        const req = context.switchToHttp().getRequest();
        const res = context.switchToHttp().getResponse();
        req.res = res;

        const canActivate = (await super.canActivate(context)) as boolean;
        if (!canActivate) return false;

        const user = req.user;
        const token = this.getTokenFromHeader(req.headers.authorization);

        if (!user?.loginId) {
            throw new UnauthorizedException(K.ERROR_CODES.INVALID_ACCESS_TOKEN);
        }

        const storedToken = await this.redisCache.get(user.loginId);
        if (!storedToken || storedToken.accessToken !== token) {
            throw new UnauthorizedException(K.ERROR_CODES.INVALID_ACCESS_TOKEN);
        }

        return true;
    }

    handleRequest<TUser = any>(err: any, user: TUser, info: any, context: ExecutionContext, status?: any): TUser {
        const req = context.switchToHttp().getRequest();
        const authHeader = req.headers.authorization;

        // If no auth header is present, throw an error
        if (!authHeader) {
            throw new UnauthorizedException(K.ERROR_CODES.NO_AUTH_TOKEN);
        }
        if (!authHeader?.startsWith('Bearer ')) {
            throw new UnauthorizedException(K.ERROR_CODES.INVALID_ACCESS_TOKEN);
        }

        if (err || !user) {
            if (
                info instanceof TokenExpiredError ||
                info instanceof JsonWebTokenError ||
                !context.switchToHttp().getRequest().headers.authorization ||
                err?.response?.statusCode ==
                K.ERROR_CODES.INVALID_ACCESS_TOKEN.statusCode
            ) {
                throw new UnauthorizedException(K.ERROR_CODES.INVALID_ACCESS_TOKEN);
            } else {
                throw new UnauthorizedException(K.ERROR_CODES.AUTH_ERROR);
            }
        }

        return user;
    }

    private getTokenFromHeader(authHeader?: string): string {
        this.validateAuthorizationHeader(authHeader);

        const parts = authHeader!.split(' ');
        return parts[1];
    }

    private validateAuthorizationHeader(authHeader?: string): void {
        if (!authHeader) {
            throw new UnauthorizedException(K.ERROR_CODES.NO_AUTH_TOKEN);
        }

        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
            throw new UnauthorizedException(K.ERROR_CODES.INVALID_ACCESS_TOKEN);
        }
    }
}
