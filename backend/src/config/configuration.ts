import { registerAs } from '@nestjs/config';

const env = process.env;

export default registerAs('config', () => ({
  server: {
    port: env.PORT,
    env: env.NODE_ENV,
  },
  swagger: {
    enabled: env.SWAGGER_ENABLED,
  },
  pg: {
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    pass: env.DB_PASS,
    db: env.DB_NAME,
  },
  redis: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    pass: env.REDIS_PASS,
    ttl: env.REDIS_TTL,
  },
  jwt: {
    secret: env.JWT_SECRET,
    expiry: env.JWT_EXPIRES_IN,
    refreshSecret: env.JWT_REFRESH_SECRET,
    refreshExpiry: env.JWT_REFRESH_EXPIRES_IN,
  },
  cookie: {
    secret: env.COOKIE_SECRET,
  },
}));
