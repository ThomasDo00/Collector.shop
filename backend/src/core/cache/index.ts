import { createClient, RedisClientType } from 'redis';
import { env } from '@core/config/env.js';
import { logger } from '@core/logger/index.js';

let redisClient: RedisClientType | null = null;

export const getRedisClient = async (): Promise<RedisClientType> => {
  if (!redisClient) {
    redisClient = createClient({
      url: env.REDIS_URL,
    });

    redisClient.on('error', (err) => {
      logger.error({ err }, 'Redis Client Error');
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    await redisClient.connect();
  }

  return redisClient;
};

export const closeRedisClient = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis connection closed');
  }
};

// Cache utility functions
export const cacheSet = async (
  key: string,
  value: string,
  ttlSeconds?: number
): Promise<void> => {
  const client = await getRedisClient();
  if (ttlSeconds) {
    await client.setEx(key, ttlSeconds, value);
  } else {
    await client.set(key, value);
  }
};

export const cacheGet = async (key: string): Promise<string | null> => {
  const client = await getRedisClient();
  return client.get(key);
};

export const cacheDel = async (key: string): Promise<void> => {
  const client = await getRedisClient();
  await client.del(key);
};
