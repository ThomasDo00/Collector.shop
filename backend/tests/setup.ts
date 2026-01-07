/**
 * Vitest setup file
 * Sets up test environment variables before running tests
 */

// Set minimal environment variables required for tests
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.JWT_SECRET = 'test-jwt-secret-key-minimum-32-characters-long';
process.env.JWT_EXPIRES_IN = '24h';
process.env.JWT_REFRESH_EXPIRES_IN = '30d';
process.env.API_HOST = '0.0.0.0';
process.env.API_PORT = '3000';
