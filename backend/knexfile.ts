import { config } from 'dotenv';

config();

const env = process.env;

export default {
    develop: {
        client: 'pg',
        connection: {
            host: env.DB_HOST,
            user: env.DB_USER,
            password: env.DB_PASS,
            database: env.DB_NAME,
            port: Number(env.DB_PORT) || 5432,
        },
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            directory: './db/migrations',
            tableName: 'knex_migrations',
        },
        seeds: {
            directory: './db/seeds',
        }
    }
}