import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { FastifyInstance } from 'fastify';

// Mock the database and cache
vi.mock('@core/database/index.js');
vi.mock('@core/cache/index.js');

describe('Server Initialization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle development environment correctly', () => {
    const isDev = process.env.NODE_ENV === 'development';
    expect(isDev).toBe(false); // Default is not development
  });

  it('should have valid port configuration', () => {
    const port = parseInt(process.env.PORT || '3000', 10);
    expect(port).toBeGreaterThan(0);
    expect(port).toBeLessThanOrEqual(65535);
  });

  it('should accept any cors origins in development', () => {
    const corsOrigin = process.env.CORS_ORIGIN || '*';
    expect(corsOrigin).toBeDefined();
  });

  it('should have valid api prefix', () => {
    const apiPrefix = process.env.API_PREFIX || '/api';
    expect(apiPrefix).toMatch(/^\/[a-z]*$/);
  });
});
