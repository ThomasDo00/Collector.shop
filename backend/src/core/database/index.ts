import knex from 'knex';
import { env } from '@core/config/env.js';
import { logger } from '@core/logger/index.js';
import knexConfig from './knexfile.js';

let db: knex.Knex | null = null;

export const getDatabase = (): knex.Knex => {
  if (!db) {
    const config = knexConfig[env.NODE_ENV];
    db = knex(config);
    logger.info('Database connection initialized');
  }
  return db;
};

export const closeDatabase = async (): Promise<void> => {
  if (db) {
    await db.destroy();
    db = null;
    logger.info('Database connection closed');
  }
};

export { type Knex } from 'knex';
