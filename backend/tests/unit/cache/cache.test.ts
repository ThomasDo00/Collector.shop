import { describe, it, expect, vi } from 'vitest';

let mockClient: any = null;

vi.mock('redis', () => ({
  createClient: () => {
    mockClient = {
      connect: vi.fn().mockResolvedValue(undefined),
      set: vi.fn().mockResolvedValue('OK'),
      setEx: vi.fn().mockResolvedValue('OK'),
      get: vi.fn().mockResolvedValue('cached-val'),
      del: vi.fn().mockResolvedValue(1),
      quit: vi.fn().mockResolvedValue(undefined),
      on: vi.fn(),
    };
    return mockClient;
  },
}));

describe('cache utilities', () => {
  it('cacheSet uses setEx when ttl provided and cacheGet/cacheDel work', async () => {
    const cache = await import('../../../src/core/cache/index.js');

    await cache.cacheSet('k1', 'v1', 60);
    expect(mockClient.setEx).toHaveBeenCalledWith('k1', 60, 'v1');

    const val = await cache.cacheGet('k1');
    expect(val).toBe('cached-val');
    expect(mockClient.get).toHaveBeenCalledWith('k1');

    await cache.cacheDel('k1');
    expect(mockClient.del).toHaveBeenCalledWith('k1');
  });

  it('closeRedisClient calls quit', async () => {
    const cache = await import('../../../src/core/cache/index.js');
    await cache.closeRedisClient();
    expect(mockClient.quit).toHaveBeenCalled();
  });
});
