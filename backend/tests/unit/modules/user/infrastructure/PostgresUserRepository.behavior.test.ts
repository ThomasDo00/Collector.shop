import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostgresUserRepository } from '@modules/user/infrastructure/PostgresUserRepository';

describe('PostgresUserRepository behavior', () => {
  let mockDb: any;
  let repo: PostgresUserRepository;
  const nowIso = new Date().toISOString();

  beforeEach(() => {
    // build a lightweight query-builder mock that supports chaining and .returning()
    const qb: any = {};

    qb.where = (..._args: any[]) => qb;
    qb.whereRaw = (..._args: any[]) => qb;

    qb.first = async () => (mockDb.__firstResult ?? null);

    qb.insert = (..._args: any[]) => ({
      returning: async () => mockDb.__insertResult ?? null,
    });

    qb.update = (..._args: any[]) => {
      // return a promise that resolves to numeric result if awaited directly
      const p: any = Promise.resolve(mockDb.__updateResult ?? 0);
      p.returning = async () => mockDb.__updateReturningResult ?? null;
      return p;
    };

    qb.count = (..._args: any[]) => ({ first: async () => mockDb.__countResult ?? { count: '0' } });

    qb.select = (..._args: any[]) => qb;

    mockDb = vi.fn().mockReturnValue(qb) as any;

    // helpers to set results
    (mockDb as any).__setFirst = (obj: any) => {
      (mockDb as any).__firstResult = obj;
    };
    (mockDb as any).__setInsert = (obj: any) => {
      (mockDb as any).__insertResult = obj;
    };
    (mockDb as any).__setUpdate = (num: number) => {
      (mockDb as any).__updateResult = num;
    };
    (mockDb as any).__setUpdateReturning = (obj: any) => {
      (mockDb as any).__updateReturningResult = obj;
    };
    (mockDb as any).__setCount = (obj: any) => {
      (mockDb as any).__countResult = obj;
    };

    repo = new PostgresUserRepository(mockDb as any);
  });

  it('maps row to user on findById', async () => {
    (mockDb as any).__setFirst({
      id: 'id-1',
      email: 'u@test.com',
      username: 'u1',
      password_hash: 'h',
      role: 'buyer',
      status: 'active',
      first_name: 'First',
      last_name: 'Last',
      avatar_url: null,
      created_at: nowIso,
      updated_at: nowIso,
    });

    const res = await repo.findById('id-1');
    expect(res).toBeDefined();
    expect(res?.email).toBe('u@test.com');
    expect(res?.createdAt).toBeInstanceOf(Date);
  });

  it('returns null when not found', async () => {
    (mockDb as any).__setFirst(null);
    const res = await repo.findByEmail('missing@test.com');
    expect(res).toBeNull();
  });

  it('creates a user and returns mapped user', async () => {
    (mockDb as any).__setInsert([{ id: 'new-id', email: 'n@test.com', username: 'n', password_hash: 'h', role: 'buyer', status: 'pending', first_name: null, last_name: null, avatar_url: null, created_at: nowIso, updated_at: nowIso }]);

    const created = await repo.create({ email: 'n@test.com', username: 'n', passwordHash: 'h' } as any);
    expect(created).toBeDefined();
    expect(created.id).toBe('new-id');
  });

  it('update returns null when no row', async () => {
    (mockDb as any).__setUpdateReturning([]);
    (mockDb as any).__setUpdate(0);
    const updated = await repo.update('id-x', { firstName: 'A' } as any);
    expect(updated).toBeNull();
  });

  it('delete returns boolean based on result', async () => {
    (mockDb as any).__setUpdate(1);
    const res = await repo.delete('id-x');
    expect(res).toBe(true);

    (mockDb as any).__setUpdate(0);
    const res2 = await repo.delete('id-y');
    expect(res2).toBe(false);
  });

  it('emailExists and usernameExists convert counts', async () => {
    (mockDb as any).__setCount({ count: '2' });
    const r1 = await repo.emailExists('a@test.com');
    expect(r1).toBe(true);

    (mockDb as any).__setCount({ count: '0' });
    const r2 = await repo.usernameExists('u');
    expect(r2).toBe(false);
  });
});
