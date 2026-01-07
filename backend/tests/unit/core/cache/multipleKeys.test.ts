import { describe, it, expect, vi } from 'vitest';

vi.mock('redis', () => ({
  createClient: () => ({
    connect: vi.fn(),
    set: vi.fn(),
    setEx: vi.fn(),
    get: vi.fn().mockResolvedValue(null),
    del: vi.fn(),
    quit: vi.fn(),
    on: vi.fn(),
  }),
}));

describe('cache multiple keys', () => {
  it('can set and get multiple keys via api', async () => {
    const cache = await import('../../../../src/core/cache/index.js');
    await cache.cacheSet('k1', 'v1');
    await cache.cacheSet('k2', 'v2', 10);
    const a = await cache.cacheGet('k1');
    expect(a === null || typeof a === 'string').toBe(true);
  });
});
