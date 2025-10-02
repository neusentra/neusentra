import { HttpException } from '@nestjs/common';
import * as K from 'src/common/constants';
import { UtilsService } from 'src/common/utils/utils.service';

export class DbExceptionError extends HttpException {
  constructor(props, context) {
    const utils = new UtilsService();
    const CONTEXT = 400;

    if (context.includes('duplicate key value violates unique constraint')) {
      console.log(props);
      props = {
        statusCode: K.ERROR_CODES.INPUT.statusCode,
        message: [
          `${utils.toCamel(props.detail.split(/[()]/, 2)[1])} should be unique`,
        ],
      };
      context = CONTEXT;
    } else if (context.includes('violates foreign key constraint')) {
      props = {
        statusCode: K.ERROR_CODES.INPUT.statusCode,
        message: [
          `${utils.toCamel(props.detail.split(/[()]/, 2)[1])} is invalid`,
        ],
      };
      context = CONTEXT;
    } else if (context.includes('violates check constraint')) {
      props = {
        statusCode: K.ERROR_CODES.INPUT.statusCode,
        message: [
          `${utils.toCamel(
            context.split(/"(.*?)"/g, 2)[1],
          )} should be a allowed value`,
        ],
      };
      context = CONTEXT;
    }
    super(props, context);
  }
}
