import type { Knex } from 'knex';
import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
config({ path: path.resolve(__dirname, '../../../../.env') });

// DATABASE_URL must be defined via environment variables (.env or CI/CD secrets)
// Never hardcode credentials in the source code
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is not defined. Please set it in your .env file or environment variables.\n' +
    'Format: postgresql://user:password@host:port/database'
  );
}

const knexConfig: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg',
    connection: databaseUrl,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: path.join(__dirname, 'migrations'),
      extension: 'ts',
    },
    seeds: {
      directory: path.join(__dirname, 'seeds'),
      extension: 'ts',
    },
  },

  test: {
    client: 'pg',
    connection: databaseUrl,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: path.join(__dirname, 'migrations'),
      extension: 'ts',
    },
    seeds: {
      directory: path.join(__dirname, 'seeds'),
      extension: 'ts',
    },
  },

  production: {
    client: 'pg',
    connection: {
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
    },
    pool: {
      min: 2,
      max: 20,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: path.join(__dirname, 'migrations'),
    },
    seeds: {
      directory: path.join(__dirname, 'seeds'),
    },
  },
};

export default knexConfig;
