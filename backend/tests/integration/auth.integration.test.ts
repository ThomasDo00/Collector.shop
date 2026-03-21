import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers';
import Fastify, { FastifyInstance } from 'fastify';
import jwt from '@fastify/jwt';
import sensible from '@fastify/sensible';
import knex, { Knex } from 'knex';
import path from 'node:path';

let container: StartedTestContainer;
let db: Knex;
let fastify: FastifyInstance;

vi.mock('@core/database/index.js', () => ({
  getDatabase: () => db,
  closeDatabase: vi.fn(),
}));

vi.mock('@core/cache/index.js', () => ({
  getRedisClient: vi.fn(),
  cacheGet: vi.fn().mockResolvedValue(null),
  cacheSet: vi.fn().mockResolvedValue(undefined),
  cacheDel: vi.fn().mockResolvedValue(undefined),
  cacheDelPattern: vi.fn().mockResolvedValue(undefined),
  closeRedisClient: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@core/metrics/index.js', () => ({
  register: { metrics: vi.fn(), contentType: 'text/plain' },
  httpRequestDuration: { observe: vi.fn(), startTimer: vi.fn() },
  httpRequestsTotal: { inc: vi.fn() },
  httpActiveRequests: { inc: vi.fn(), dec: vi.fn() },
  registeredUsers: { inc: vi.fn(), dec: vi.fn(), set: vi.fn() },
  activeProducts: { inc: vi.fn(), dec: vi.fn(), set: vi.fn() },
}));

vi.mock('@core/storage/index.js', () => ({
  initStorage: vi.fn().mockResolvedValue(undefined),
  uploadFile: vi.fn().mockResolvedValue('http://localhost:9000/bucket/file.jpg'),
}));

import { userRoutes } from '@modules/user/adapters/user.routes.js';

beforeAll(async () => {
  process.env.NODE_ENV = 'test';

  container = await new GenericContainer('postgres:16-alpine')
    .withEnvironment({
      POSTGRES_USER: 'test',
      POSTGRES_PASSWORD: 'test',
      POSTGRES_DB: 'test',
    })
    .withExposedPorts(5432)
    .withWaitStrategy(Wait.forListeningPorts())
    .start();

  const port = container.getMappedPort(5432);
  const host = container.getHost();
  const connectionString = `postgresql://test:test@${host}:${port}/test`;

  process.env.DATABASE_URL = connectionString;

  db = knex({
    client: 'pg',
    connection: connectionString,
    migrations: {
      tableName: 'knex_migrations',
      directory: path.resolve(process.cwd(), 'src/core/database/migrations'),
      extension: 'ts',
      loadExtensions: ['.ts'],
    },
  });

  // Wait for PostgreSQL to be fully ready (port open ≠ accepting queries)
  for (let i = 0; i < 15; i++) {
    try { await db.raw('SELECT 1'); break; } catch { await new Promise(r => setTimeout(r, 1000)); }
  }

  await db.migrate.latest();

  fastify = Fastify({ logger: false });
  await fastify.register(jwt, { secret: process.env.JWT_SECRET ?? 'test-jwt-secret-for-ci-minimum-32-chars' });
  await fastify.register(sensible);
  await fastify.register(userRoutes, { prefix: '/api/users' });
  await fastify.ready();
}, 60000);

afterAll(async () => {
  await fastify.close();
  await db.destroy();
  await container.stop();
});

describe('Auth integration', () => {
  const validUser = {
    email: 'integration@example.com',
    username: 'integrationuser',
    password: 'SecurePass123!',
  };

  it('POST /api/users/register with valid data → 201', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/users/register',
      payload: validUser,
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data.email).toBe(validUser.email);
    expect(body.data.username).toBe(validUser.username);
  });

  it('POST /api/users/register with duplicate email → 409', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/users/register',
      payload: validUser,
    });

    expect(res.statusCode).toBe(409);
    const body = JSON.parse(res.payload);
    expect(body.error).toMatch(/EMAIL_EXISTS|USERNAME_EXISTS/);
  });

  it('POST /api/users/register with missing fields → 400', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/users/register',
      payload: { email: 'missing@example.com' },
    });

    expect(res.statusCode).toBe(400);
  });

  it('POST /api/users/login with valid credentials → 200 + token', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/users/login',
      payload: {
        emailOrUsername: validUser.email,
        password: validUser.password,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data.accessToken).toBeDefined();
  });

  it('POST /api/users/login with wrong password → 401', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/users/login',
      payload: {
        emailOrUsername: validUser.email,
        password: 'WrongPassword999!',
      },
    });

    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.payload);
    expect(body.error).toBe('INVALID_CREDENTIALS');
  });
});
