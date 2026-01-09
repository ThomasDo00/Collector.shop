import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PostgresUserRepository } from '@modules/user/infrastructure/PostgresUserRepository.js';
import type { Knex } from 'knex';

describe('PostgresUserRepository', () => {
  let mockDb: Knex;
  let repository: PostgresUserRepository;
  let queryBuilder: any;

  beforeEach(() => {
    queryBuilder = {
      where: vi.fn().mockReturnThis(),
      whereRaw: vi.fn().mockReturnThis(),
      first: vi.fn().mockResolvedValue(null),
      insert: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([]),
      select: vi.fn().mockReturnThis(),
    };

    mockDb = vi.fn().mockReturnValue(queryBuilder) as any;

    repository = new PostgresUserRepository(mockDb);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should instantiate repository', () => {
    expect(repository).toBeDefined();
  });

  it('should have findById method', () => {
    expect(repository).toHaveProperty('findById');
    expect(typeof repository.findById).toBe('function');
  });

  it('should have findByEmail method', () => {
    expect(repository).toHaveProperty('findByEmail');
    expect(typeof repository.findByEmail).toBe('function');
  });

  it('should have findByUsername method', () => {
    expect(repository).toHaveProperty('findByUsername');
    expect(typeof repository.findByUsername).toBe('function');
  });

  it('should have create method', () => {
    expect(repository).toHaveProperty('create');
    expect(typeof repository.create).toBe('function');
  });
});
