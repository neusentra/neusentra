export const POSTGRES_CONNECTION = {
  NAME: 'DB Replica',
  PROVIDER: 'postgres_connection',
  FACTORY: 'pgReadConnectionFactory',
};

export const DATABASE_CONNECTION = 'Database connection';

export const MAX_ATTEMPT = 9;
export const ATTEMPT_DELAY = 1000;

export const BATCH_INSERT_SIZE = 1000;
export const MAX_CONNECTION = 20;
