import { describe, it, expect } from 'vitest';

describe('env defaults', () => {
  it('env module provides defaults when values present', async () => {
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = 'http://x';
    process.env.REDIS_URL = 'http://r';
    process.env.JWT_SECRET = 'a'.repeat(32);
    const mod = await import('../../../../src/core/config/env.js');
    expect(mod.env.NODE_ENV).toBe('test');
  });
});
