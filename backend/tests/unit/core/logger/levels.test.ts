import { describe, it, expect } from 'vitest';

describe('logger levels', () => {
  it('logger exposes methods', async () => {
    const mod = await import('../../../../src/core/logger/index.js');
    expect(typeof mod.logger.info).toBe('function');
    expect(typeof mod.logger.debug).toBe('function');
  });
});
