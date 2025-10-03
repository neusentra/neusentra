import * as Joi from 'joi';
import * as K from 'src/common/constants';

export default Joi.object({
  // Server
  PORT: Joi.number().default(3333),
  NODE_ENV: Joi.string()
    .valid(...K.NODE_ENVIRONMENTS)
    .default(K.NODE_ENVIRONMENTS[0]),
  
  // Logger
  LOGGER_LEVEL: Joi.string()
    .valid(...K.LOGGER_LEVELS)
    .default(K.LOGGER_LEVELS[0]),
  PRETTY_PRINT_LOG: Joi.boolean().default('false'),

  // Swagger
  SWAGGER_ENABLED: Joi.string()
    .valid('true', 'false')
    .default('false'),

  // Pg / DB
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(K.DATABASE_DEFAULT_PORT),
  DB_NAME: Joi.string().required(),
  DB_USER: Joi.string().required(),
  DB_PASS: Joi.string().required(),

  // Redis
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().default(K.REDIS_DEFAULT_PORT),
  REDIS_PASS: Joi.string().allow(''),
  REDIS_TTL: Joi.number().default(K.REDIS_DEFAULT_TTL),

  // JWT
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().required(),
});
