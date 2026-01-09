import { describe, it, expect } from 'vitest';
import { logger } from '@core/logger/index.js';

describe('Logger Instance', () => {
  it('should have logger instance', () => {
    expect(logger).toBeDefined();
  });

  it('should have logging methods', () => {
    expect(logger).toHaveProperty('info');
    expect(logger).toHaveProperty('error');
    expect(logger).toHaveProperty('warn');
    expect(logger).toHaveProperty('debug');
  });

  it('should be callable for logging', () => {
    expect(() => {
      logger.info('Test message');
      logger.warn('Warning message');
      logger.error('Error message');
    }).not.toThrow();
  });

  it('should be a pino logger instance', () => {
    expect(typeof logger.info).toBe('function');
  });
});
