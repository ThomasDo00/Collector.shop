import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Fastify from 'fastify';

vi.mock('@modules/user/domain/usecases/RegisterUser.js', () => {
  class EmailAlreadyExistsError extends Error {}
  class UsernameAlreadyExistsError extends Error {}
  return {
    RegisterUser: class {
      constructor() {}
      async execute(body: any) {
        if (body.email === 'exists@test.com') throw new EmailAlreadyExistsError('exists');
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
  return {
    LoginUser: class {
      constructor() {}
      async execute(body: any) {
        if (body.emailOrUsername === 'bad') throw new InvalidCredentialsError('bad');
        if (body.emailOrUsername === 'suspended') throw new AccountSuspendedError('s');
        if (body.emailOrUsername === 'notverified') throw new EmailNotVerifiedError('e');
        return { userId: 'u1', email: 'u@test.com', username: 'u', role: 'buyer', status: 'active' };
      }
    },
    InvalidCredentialsError,
    EmailNotVerifiedError,
    AccountSuspendedError,
    AccountBannedError,
    loginCredentialsSchema: {} as any,
  };
});

import { userRoutes } from '@modules/user/adapters/user.routes';

describe('User Routes Additional Coverage', () => {
  let fastify: any;

  beforeEach(async () => {
    fastify = Fastify({ logger: false });
    fastify.decorate('jwt', { sign: () => 'token' });
    await fastify.register(userRoutes, { prefix: '/api/users' });
    await fastify.ready();
  });

  afterEach(async () => {
    await fastify.close();
  });

  it('POST /api/users/register with valid form', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/users/register',
      payload: { email: 'test@example.com', username: 'testuser', password: 'SecurePass123!' },
    });

    expect(res.statusCode).toBe(201);
  });

  it('POST /api/users/login with valid credentials', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/users/login',
      payload: { emailOrUsername: 'test@example.com', password: 'password' },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.data.accessToken).toBeTruthy();
  });

  it('POST /api/users/login with suspended account', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/users/login',
      payload: { emailOrUsername: 'suspended', password: 'password' },
    });

    expect(res.statusCode).toBe(403);
    const body = JSON.parse(res.payload);
    expect(body.error).toBe('ACCOUNT_SUSPENDED');
  });

  it('POST /api/users/login with unverified email', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/users/login',
      payload: { emailOrUsername: 'notverified', password: 'password' },
    });

    expect(res.statusCode).toBe(403);
    const body = JSON.parse(res.payload);
    expect(body.error).toBe('EMAIL_NOT_VERIFIED');
  });

  it('GET /api/users/health returns module health', async () => {
    const res = await fastify.inject({
      method: 'GET',
      url: '/api/users/health',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.module).toBe('users');
  });
});
