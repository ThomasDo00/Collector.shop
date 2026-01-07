import { describe, it, expect } from 'vitest';

describe('knexfile', () => {
  it('exports configuration', async () => {
    // Ensure DATABASE_URL is defined for the test environment
    process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/testdb';
    const mod = await import('../../../src/core/database/knexfile.js');
    expect(mod).toBeDefined();
  });
});
