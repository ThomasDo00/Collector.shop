import { describe, it, expect, beforeEach } from 'vitest';

describe('env loader', () => {
  beforeEach(() => {
    // Provide minimal required env vars
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = 'https://example.com/db';
    process.env.REDIS_URL = 'https://example.com/redis';
    process.env.JWT_SECRET = 'a'.repeat(32);
  });

  it('loads and validates env variables', async () => {
    const mod = await import('../../../src/core/config/env.js');
    expect(mod.env).toBeDefined();
    expect(mod.env.DATABASE_URL).toBe(process.env.DATABASE_URL);
    expect(mod.env.JWT_SECRET.length).toBeGreaterThanOrEqual(32);
  });
});
