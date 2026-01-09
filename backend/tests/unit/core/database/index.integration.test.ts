import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getDatabase, closeDatabase } from '@core/database/index.js';

describe('Database Index Integration', () => {
  afterAll(async () => {
    await closeDatabase();
  });

  it('should get database instance', () => {
    const db = getDatabase();
    expect(db).toBeDefined();
  });

  it('should return same instance on multiple calls', () => {
    const db1 = getDatabase();
    const db2 = getDatabase();
    expect(db1).toBe(db2);
  });

  it('should close database', async () => {
    await closeDatabase();
    // Verify it can be re-initialized
    const db = getDatabase();
    expect(db).toBeDefined();
    await closeDatabase();
  });
});
