import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import Fastify, { FastifyInstance } from 'fastify';
import jwt from '@fastify/jwt';
import sensible from '@fastify/sensible';
import multipart from '@fastify/multipart';
import knex, { Knex } from 'knex';
import path from 'node:path';
import bcrypt from 'bcrypt';

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

import { catalogRoutes } from '@modules/catalog/catalog.routes.js';

beforeAll(async () => {
  process.env.NODE_ENV = 'test';

  container = await new GenericContainer('postgres:16-alpine')
    .withEnvironment({
      POSTGRES_USER: 'test',
      POSTGRES_PASSWORD: 'test',
      POSTGRES_DB: 'test',
    })
    .withExposedPorts(5432)
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

  await db.migrate.latest();

  fastify = Fastify({ logger: false });
  await fastify.register(jwt, { secret: process.env.JWT_SECRET ?? 'test-jwt-secret-for-ci-minimum-32-chars' });
  await fastify.register(sensible);
  await fastify.register(multipart);
  await fastify.register(catalogRoutes, { prefix: '/api/catalog' });
  await fastify.ready();
}, 60000);

afterAll(async () => {
  await fastify.close();
  await db.destroy();
  await container.stop();
});

async function createTestUser(email: string, username: string): Promise<{ id: string }> {
  const passwordHash = await bcrypt.hash('TestPass123!', 12);
  const [user] = await db('users')
    .insert({
      email,
      username,
      password_hash: passwordHash,
      role: 'seller',
      status: 'active',
    })
    .returning('id');
  return user;
}

async function createTestCategory(name: string, slug: string): Promise<{ id: string }> {
  const [category] = await db('categories')
    .insert({ name, slug })
    .returning('id');
  return category;
}

describe('Catalog integration', () => {
  let categoryId: string;
  let sellerId: string;
  let sellerToken: string;
  let otherSellerId: string;
  let otherToken: string;
  let createdProductId: string;

  beforeAll(async () => {
    const category = await createTestCategory('Sneakers', 'sneakers');
    categoryId = category.id;

    const seller = await createTestUser('seller@catalog.test', 'catalogseller');
    sellerId = seller.id;
    sellerToken = fastify.jwt.sign({ userId: sellerId, role: 'seller' });

    const otherSeller = await createTestUser('other@catalog.test', 'otherseller');
    otherSellerId = otherSeller.id;
    otherToken = fastify.jwt.sign({ userId: otherSellerId, role: 'seller' });
  });

  it('GET /api/catalog/products → 200, returns array', async () => {
    const res = await fastify.inject({
      method: 'GET',
      url: '/api/catalog/products',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  it('GET /api/catalog/categories → 200, returns array', async () => {
    const res = await fastify.inject({
      method: 'GET',
      url: '/api/catalog/categories',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
  });

  it('POST /api/catalog/products without auth → 401', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/catalog/products',
      payload: {
        title: 'Test Product',
        price: 99.99,
        condition: 'new',
        categoryId,
        imageUrl: 'http://example.com/img.jpg',
      },
    });

    expect(res.statusCode).toBe(401);
  });

  it('POST /api/catalog/products with auth → 201', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/catalog/products',
      headers: { authorization: `Bearer ${sellerToken}` },
      payload: {
        title: 'Air Jordan Integration',
        price: 150,
        condition: 'new',
        categoryId,
        imageUrl: 'http://example.com/jordan.jpg',
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data.title).toBe('Air Jordan Integration');
    createdProductId = body.data.id;
  });

  it('DELETE /api/catalog/products/:id with wrong user → 403', async () => {
    const res = await fastify.inject({
      method: 'DELETE',
      url: `/api/catalog/products/${createdProductId}`,
      headers: { authorization: `Bearer ${otherToken}` },
    });

    expect(res.statusCode).toBe(403);
    const body = JSON.parse(res.payload);
    expect(body.error).toBe('FORBIDDEN');
  });

  it('DELETE /api/catalog/products/:id with auth (owner) → 204', async () => {
    const res = await fastify.inject({
      method: 'DELETE',
      url: `/api/catalog/products/${createdProductId}`,
      headers: { authorization: `Bearer ${sellerToken}` },
    });

    expect(res.statusCode).toBe(204);
  });
});
