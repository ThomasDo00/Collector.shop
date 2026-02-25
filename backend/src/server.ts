import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import sensible from '@fastify/sensible';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';

import { env } from '@core/config/env.js';
import { logger } from '@core/logger/index.js';
import { closeDatabase } from '@core/database/index.js';
import { getRedisClient, closeRedisClient, cacheGet } from '@core/cache/index.js';
import { initStorage } from '@core/storage/index.js';
import { register, httpRequestDuration, httpRequestsTotal, httpActiveRequests } from '@core/metrics/index.js';

// Module routes
import { userRoutes } from '@modules/user/adapters/user.routes.js';
import { catalogRoutes } from '@modules/catalog/catalog.routes.js';
import { cartRoutes } from '@modules/cart/cart.routes.js';

const fastify = Fastify({
  logger: {
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport:
      env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
  },
});

// Register plugins
async function registerPlugins() {
  // CORS
  await fastify.register(cors, {
    origin: env.NODE_ENV === 'production' ? ['https://collector.shop'] : true,
    credentials: true,
  });

  // Security headers
  await fastify.register(helmet, {
    contentSecurityPolicy: env.NODE_ENV === 'production',
  });

  // Rate limiting (100 requests per minute) — in-memory store
  // Note: @fastify/rate-limit requires ioredis (not redis v4) for Redis-backed rate-limiting
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // Connect Redis eagerly so cache and blacklist are ready on first request
  await getRedisClient();

  // Sensible defaults (better error handling)
  await fastify.register(sensible);

  // Multipart file uploads (max 5MB)
  await fastify.register(multipart, {
    limits: { fileSize: 5 * 1024 * 1024 },
  });

  // JWT authentication
  await fastify.register(jwt, {
    secret: env.JWT_SECRET,
  });

  // Swagger documentation
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'Collector.shop API',
        description: 'API for the Collector.shop marketplace',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://localhost:${env.API_PORT}`,
          description: 'Development server',
        },
      ],
      tags: [
        { name: 'Health', description: 'Health check endpoints' },
        { name: 'Users', description: 'User management endpoints' },
        { name: 'Catalog', description: 'Article catalog endpoints' },
        { name: 'Payments', description: 'Payment endpoints' },
      ],
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });
}

const requestStartTimes = new WeakMap<object, number>();

// Register routes
async function registerRoutes() {
  // Metrics — track request duration and count
  fastify.addHook('onRequest', async (request) => {
    httpActiveRequests.inc();
    requestStartTimes.set(request, Date.now());
  });

  fastify.addHook('onResponse', async (request, reply) => {
    httpActiveRequests.dec();
    const duration = (Date.now() - (requestStartTimes.get(request) ?? Date.now())) / 1000;
    requestStartTimes.delete(request);
    const route = request.routerPath ?? request.url;
    const labels = { method: request.method, route, status_code: String(reply.statusCode) };
    httpRequestDuration.observe(labels, duration);
    httpRequestsTotal.inc(labels);
  });

  // JWT blacklist check — runs on every request with a Bearer token
  fastify.addHook('onRequest', async (request, reply) => {
    const auth = request.headers.authorization;
    if (auth?.startsWith('Bearer ')) {
      const token = auth.slice(7);
      try {
        const blacklisted = await cacheGet(`blacklist:${token}`);
        if (blacklisted) {
          return reply.status(401).send({
            success: false,
            error: 'TOKEN_REVOKED',
            message: 'Token has been revoked. Please login again.',
          });
        }
      } catch {
        // Redis unavailable — fail open (request proceeds)
      }
    }
  });

  // Health check
  fastify.get('/health', {
    schema: {
      description: 'Health check endpoint',
      tags: ['Health'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            uptime: { type: 'number' },
          },
        },
      },
    },
  }, async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  });

  // Prometheus metrics endpoint (internal — not exposed via Ingress)
  fastify.get('/metrics', async (_request, reply) => {
    reply.header('Content-Type', register.contentType);
    return reply.send(await register.metrics());
  });

  // API routes
  await fastify.register(userRoutes, { prefix: '/api/users' });
  await fastify.register(catalogRoutes, { prefix: '/api/catalog' });
  await fastify.register(cartRoutes, { prefix: '/api/cart' });

  // Future modules will be registered here:
  // await fastify.register(paymentRoutes, { prefix: '/api/payments' });
  // await fastify.register(chatRoutes, { prefix: '/api/chat' });
}

// Graceful shutdown
async function gracefulShutdown(signal: string) {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  try {
    await fastify.close();
    await closeDatabase();
    await closeRedisClient();
    logger.info('Graceful shutdown complete');
    process.exit(0);
  } catch (error) {
    logger.error({ error }, 'Error during graceful shutdown');
    process.exit(1);
  }
}

// Start server
async function start() {
  try {
    await registerPlugins();
    await registerRoutes();
    try {
      await initStorage();
    } catch (error) {
      logger.warn({ error }, 'Storage initialization failed — file uploads will be unavailable');
    }

    await fastify.listen({
      host: env.API_HOST,
      port: env.API_PORT,
    });

    logger.info(`Server running at http://${env.API_HOST}:${env.API_PORT}`);
    logger.info(`API Documentation available at http://${env.API_HOST}:${env.API_PORT}/docs`);

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

await start();
