import { describe, it, expect, vi } from 'vitest';

describe('database index', () => {
  it('exports getDatabase and closeDatabase', async () => {
    const mod = await import('../../../src/core/database/index.js');
    expect(typeof mod.getDatabase).toBe('function');
    expect(typeof mod.closeDatabase).toBe('function');
  });
});
