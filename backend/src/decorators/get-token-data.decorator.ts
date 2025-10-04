import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { jwtDecode } from 'jwt-decode';

export const GetLoginId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const token = req?.headers?.authorization?.split(' ')[1];
    const decoded = jwtDecode(token);
    const loginId = decoded['loginId'];
    if (!loginId) {
      throw new BadRequestException('Error decoding bearer token');
    }
    return loginId;
  },
);

export const GetUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const token = req?.headers?.authorization?.split(' ')[1];
    const decoded = jwtDecode(token);
    const userId = decoded['userId'];
    if (!userId) {
      throw new BadRequestException('Error decoding bearer token');
    }
    return userId;
  },
);

export const GetUserRole = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const token = req?.headers?.authorization?.split(' ')[1];
    const decoded = jwtDecode(token);
    const role = decoded['role'];
    if (!role) {
      throw new BadRequestException('Error decoding bearer token');
    }
    return role;
  },
);

export const GetUserPermissions = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const token = req?.headers?.authorization?.split(' ')[1];
    const decoded = jwtDecode(token);
    const permissions = decoded['permissions'];
    if (!permissions) {
      throw new BadRequestException('Error decoding bearer token');
    }
    return permissions;
  },
);
