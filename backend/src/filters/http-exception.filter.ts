/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  ForbiddenException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CustomLogger } from 'src/logger/custom-logger.service';
import * as K from 'src/common/constants';

interface ResError {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: any;
}

interface LogError extends ResError {
  timestamp?: string;
  path?: string;
  host?: string;
  response?: ResError;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: CustomLogger) {
    this.logger.setContext(HttpExceptionFilter.name);
  }

  getErrorCode(exception: any) {
    if (exception instanceof BadRequestException) return K.ERROR_CODES.INPUT;
    if (exception instanceof NotFoundException) return K.ERROR_CODES.NOT_FOUND;
    if (exception instanceof ForbiddenException) return K.ERROR_CODES.FORBIDDEN;
    if (exception instanceof UnauthorizedException) {
      return K.ERROR_CODES.AUTH_ERROR;
    }
    if (exception instanceof InternalServerErrorException) {
      return K.ERROR_CODES.INTERNAL;
    }
    if (exception.code === K.FASTIFY_ERR_BODY_TOO_LARGE) {
      return K.ERROR_CODES.REQUEST_BODY_LARGE;
    }
    return K.ERROR_CODES.DEFAULT;
  }

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : (response?.status ?? HttpStatus.FORBIDDEN);

    let resError: ResError;
    let msg: string;

    if (response?.statusCode || response?.code) {
      msg = response.message;
      resError = response;
    } else if (response.data?.statusCode) {
      msg = response.data.message;
      resError = response.data;
    } else {
      const exceptionMessage = exception.message;
      msg =
        typeof exceptionMessage === 'string'
          ? exceptionMessage
          : (exceptionMessage?.message ?? 'An unknown error occurred');
      resError = this.getErrorCode(exception);
    }
    resError.success = false;
    resError.data = null;

    const logError: LogError = {
      statusCode: status,
      timestamp: new Date().toString(),
      path: request.url,
      message: msg || 'Something went wrong',
      host: request.headers.host,
      response: resError,
    };

    this.logger.log(
      `${request.method} ${request.url} ${status}
      ${JSON.stringify(logError)}`,
    );

    return response.code(status).send(resError);
  }
}
