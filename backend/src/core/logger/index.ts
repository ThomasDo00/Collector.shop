import pino from 'pino';
import { env } from '@core/config/env.js';

export const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport:
    env.NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  // Structured logging for production (JSON)
  formatters: {
    level: (label) => ({ level: label }),
  },
  base: {
    service: 'collector-api',
    env: env.NODE_ENV,
  },
});

export type Logger = typeof logger;
