import {
  ArgumentMetadata,
  HttpException,
  HttpStatus,
  ValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common';
import * as K from 'src/common/constants';

export class NeuSentraValidationPipe extends ValidationPipe {
  constructor(private readonly options?: ValidationPipeOptions) {
    super();
  }

  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    this.validatorOptions = {
      ...this.validatorOptions,
      skipMissingProperties: false,
      whitelist: true,
      forbidNonWhitelisted: false,
      ...this.options,
    };

    try {
      const result = await super.transform(value, metadata);

      if (result) {
        for (const [key, value] of Object.keys(result)) {
          if (value === null || value === undefined) delete result[key];
        }
      }

      return result;
    } catch (error) {
      const errorResponse = {
        statusCode: K.ERROR_CODES.INPUT.statusCode,
        message: error.response.message,
      };

      throw new HttpException(errorResponse, HttpStatus.BAD_REQUEST);
    }
  }
}
