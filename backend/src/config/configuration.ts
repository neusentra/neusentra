import { registerAs } from '@nestjs/config';
import { UtilsService } from 'src/common/utils/utils.service';

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
}));
