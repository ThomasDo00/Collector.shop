import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger } from './index';

describe('Logger', () => {
  beforeEach(() => {
    // Reset console mocks before each test
    vi.clearAllMocks();
  });

  describe('error', () => {
    it('should log error messages', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      logger.error('Test error message', new Error('Test error'));

      // In production/test mode, only errors are logged
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should serialize Error objects', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Test error');

      logger.error('Error occurred', error);

      expect(consoleSpy).toHaveBeenCalled();
      const loggedEntry = consoleSpy.mock.calls[0][1];
      expect(loggedEntry.context?.error).toHaveProperty('name');
      expect(loggedEntry.context?.error).toHaveProperty('message');
      expect(loggedEntry.context?.error).toHaveProperty('stack');

      consoleSpy.mockRestore();
    });

    it('should handle non-Error objects', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      logger.error('Error occurred', { customError: 'Something went wrong' });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('debug/info/warn methods', () => {
    it('should have debug, info, warn methods available', () => {
      expect(logger.debug).toBeDefined();
      expect(logger.info).toBeDefined();
      expect(logger.warn).toBeDefined();
      expect(logger.error).toBeDefined();
    });

    it('should not throw when calling logger methods', () => {
      expect(() => {
        logger.debug('Debug message');
        logger.info('Info message');
        logger.warn('Warning message');
        logger.error('Error message');
      }).not.toThrow();
    });
  });
});
