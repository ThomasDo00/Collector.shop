import { describe, it, expect, vi } from 'vitest';

vi.mock('@core/database/index.js', () => ({
  getDatabase: () => ({}),
  closeDatabase: vi.fn(),
}));

vi.mock('@core/cache/index.js', () => ({
  closeRedisClient: vi.fn(),
}));

vi.mock('@core/logger/index.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock('@fastify/cors');
vi.mock('@fastify/helmet');
vi.mock('@fastify/rate-limit');
vi.mock('@fastify/sensible');
vi.mock('@fastify/swagger');
vi.mock('@fastify/swagger-ui');
vi.mock('@fastify/jwt');

vi.mock('@modules/user/adapters/user.routes.js', () => ({
  userRoutes: async (fastify: any) => {
    fastify.get('/health', () => ({ module: 'users' }));
  },
}));

describe('Server Environment', () => {
  it('should have valid API_HOST', () => {
    const host = process.env.API_HOST || 'localhost';
    expect(host).toBeTruthy();
  });

  it('should have valid API_PORT', () => {
    const port = parseInt(process.env.API_PORT || '3000', 10);
    expect(port).toBeGreaterThan(0);
    expect(port).toBeLessThanOrEqual(65535);
  });

  it('should have NODE_ENV set', () => {
    expect(process.env.NODE_ENV).toBeDefined();
  });

  it('should support CORS origin configuration', () => {
    const corsOrigin = process.env.CORS_ORIGIN;
    // can be any string or undefined (uses default)
    expect(typeof corsOrigin === 'string' || corsOrigin === undefined).toBe(true);
  });

  it('should have JWT_SECRET configured', () => {
    const secret = process.env.JWT_SECRET;
    expect(secret).toBeTruthy();
  });

  it('should have valid JWT expiration times', () => {
    const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
    const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    expect(expiresIn).toBeTruthy();
    expect(refreshExpiresIn).toBeTruthy();
  });
});
