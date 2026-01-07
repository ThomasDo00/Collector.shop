import { describe, it, expect } from 'vitest';

describe('logger', () => {
  it('exports a pino logger with common methods', async () => {
    const mod = await import('../../../src/core/logger/index.js');
    expect(mod.logger).toBeDefined();
    expect(typeof mod.logger.info).toBe('function');
    expect(typeof mod.logger.error).toBe('function');
    // Calling should not throw
    mod.logger.info('test');
    mod.logger.error('err');
  });
});
