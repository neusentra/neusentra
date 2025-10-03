import * as Joi from 'joi';
import * as K from 'src/common/constants';

export default Joi.object({
  PORT: Joi.number().default(3333),
  NODE_ENV: Joi.string()
    .valid(...K.NODE_ENVIRONMENTS)
    .default(K.NODE_ENVIRONMENTS[0]),
  LOGGER_LEVEL: Joi.string()
    .valid(...K.LOGGER_LEVELS)
    .default(K.LOGGER_LEVELS[0]),
  PRETTY_PRINT_LOG: Joi.boolean().default('false'),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(K.DATABASE_DEFAULT_PORT),
  DB_NAME: Joi.string().required(),
  DB_USER: Joi.string().required(),
  DB_PASS: Joi.string().required(),
});
