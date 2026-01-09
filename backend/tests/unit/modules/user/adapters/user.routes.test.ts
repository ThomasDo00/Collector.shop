import Fastify from 'fastify';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock the usecases so routes don't touch DB
vi.mock('@modules/user/domain/usecases/RegisterUser.js', () => {
  class EmailAlreadyExistsError extends Error {}
  class UsernameAlreadyExistsError extends Error {}
  return {
    RegisterUser: class {
      constructor() {}
      async execute(body: any) {
        if (body.email === 'exists@example.com') throw new EmailAlreadyExistsError('exists');
        if (body.username === 'exists') throw new UsernameAlreadyExistsError('exists');
        return {
          id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          email: body.email,
          username: body.username,
          role: 'buyer',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
    },
    EmailAlreadyExistsError,
    UsernameAlreadyExistsError,
  };
});

vi.mock('@modules/user/domain/usecases/LoginUser.js', () => {
  class InvalidCredentialsError extends Error {}
  class EmailNotVerifiedError extends Error {}
  class AccountSuspendedError extends Error {}
  class AccountBannedError extends Error {}
  const loginCredentialsSchema = {} as any;
  return {
    LoginUser: class {
      constructor() {}
      async execute(body: any) {
        if (body.emailOrUsername === 'bad') throw new InvalidCredentialsError('bad');
        if (body.emailOrUsername === 'suspended') throw new AccountSuspendedError('s');
        return { userId: 'u1', email: 'u@test.com', username: 'u', role: 'buyer' };
      }
    },
    InvalidCredentialsError,
    EmailNotVerifiedError,
    AccountSuspendedError,
    AccountBannedError,
    loginCredentialsSchema,
  };
});

// We don't need DB for these route tests because usecases are mocked
import { userRoutes } from '@modules/user/adapters/user.routes.js';

describe('userRoutes', () => {
  let fastify: any;

  beforeEach(async () => {
    fastify = Fastify({ logger: false });
    // Provide a fake jwt decorator used by routes
    fastify.decorate('jwt', { sign: () => 'token' });
    await fastify.register(userRoutes, { prefix: '/api/users' });
    await fastify.ready();
  });

  afterEach(async () => {
    await fastify.close();
  });

  it('POST /api/users/register returns 201', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/users/register',
      payload: { email: 'new@test.com', username: 'new', password: 'SecurePass123!' },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data.email).toBe('new@test.com');
  });

  it('POST /api/users/register handles existing email', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/users/register',
      payload: { email: 'exists@example.com', username: 'new', password: 'Pass123!' },
    });

    expect(res.statusCode).toBe(409);
    const body = JSON.parse(res.payload);
    expect(body.error).toBe('EMAIL_EXISTS');
  });

  it('POST /api/users/login returns tokens', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/users/login',
      payload: { emailOrUsername: 'u@test.com', password: 'pwd' },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.data.accessToken).toBeDefined();
  });

  it('POST /api/users/login invalid credentials', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/users/login',
      payload: { emailOrUsername: 'bad', password: 'pwd' },
    });

    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.payload);
    expect(body.error).toBe('INVALID_CREDENTIALS');
  });
});
