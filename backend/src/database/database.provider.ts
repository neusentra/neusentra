import { Pool } from 'pg';
import { Provider } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { from, lastValueFrom, timer } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import configuration from 'src/config/configuration';
import * as K from './constants/database.constants';
import { CustomLogger } from 'src/logger/custom-logger.service';

export const pgConnectionFactory: Provider = generateDBPool({
  provider: K.POSTGRES_CONNECTION.PROVIDER,
  connectionName: K.POSTGRES_CONNECTION.NAME,
  factoryName: K.POSTGRES_CONNECTION.FACTORY,
});

function generateDBPool({
  connectionName,
  provider,
  factoryName,
}: {
  connectionName: string;
  provider: string;
  factoryName: string;
}): Provider {
  return {
    provide: provider,
    useFactory: async (config: ConfigType<typeof configuration>) => {
      const logger = new CustomLogger(factoryName);
      logger.setContext(factoryName);

      const pool = new Pool({
        host: config.pg.host,
        database: config.pg.db,
        port: config.pg.port,
        user: config.pg.user,
        password: config.pg.pass,
        max: K.MAX_CONNECTION,
      });

      return lastValueFrom(
        from(pool.connect()).pipe(
          retry({
            count: K.MAX_ATTEMPT,
            delay: (error: Error, retryCount) => {
              logger.warn(
                `Unable to connect to ${connectionName}. ${error.message}. Retrying ${retryCount}...`,
              );
              return timer(K.ATTEMPT_DELAY);
            },
            resetOnSuccess: true,
          }),
          catchError((err) => {
            logger.error(`${K.DATABASE_CONNECTION} [${connectionName}] ${err}`);
            throw err;
          }),
          tap(() => {
            logger.log(`Connected to Postgres ${connectionName} successfully!`);
          }),
        ),
      );
    },
    inject: [configuration.KEY],
  };
}
