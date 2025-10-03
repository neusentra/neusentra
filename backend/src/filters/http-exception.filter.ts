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

    let resError: ResError;
    let msg: string;
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : exception.response?.status || HttpStatus.FORBIDDEN;

    if (exception.response?.statusCode) {
      msg = exception.response.message;
      resError = exception.response;
    } else if (exception.response?.code) {
      msg = exception.response.message;
      resError = exception.response;
    } else if (exception.response?.data?.statusCode) {
      msg = exception.response.data.message;
      resError = exception.response.data;
    } else {
      msg =
        typeof exception.message === 'string'
          ? exception.message
          : exception.message.message;
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
