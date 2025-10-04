export const NODE_ENVIRONMENTS = [
  'local',
  'develop',
  'staging',
  'production',
  'test',
];

export const LOGGER_LEVELS = ['log', 'error', 'warn', 'debug'];

export const DATABASE_DEFAULT_PORT = 5432;

export const MAX_JSON_REQUEST_SIZE = 10485760;

export const FASTIFY_ERR_BODY_TOO_LARGE = 'FST_ERR_BODY_TOO_LARGE';

export const CONTENT_TYPE = {
  JSON: 'application/json',
  FORM_URL_ENCODED: 'application/x-www-form-urlencoded',
  STREAM: 'stream',
};

export const MAX_INT_LIMIT = 2147483647;

export const PUBLIC_METADATA = 'isPublic';

export const REDIS_DEFAULT_PORT = 6379;

export const REDIS_DEFAULT_TTL = 3600000;

export const JWT_ALGORITHM = 'HS512';
export const JWT_STRATEGY = { DEFAULT: 'jwt', REFRESH: 'jwt-refresh' };