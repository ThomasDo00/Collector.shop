import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostgresUserRepository } from '@modules/user/infrastructure/PostgresUserRepository';

/**
 * Full-coverage tests for PostgresUserRepository.
 * Covers: findByUsername, updateMfa, update (with row), mapToUser all fields.
 */
describe('PostgresUserRepository – full coverage', () => {
  const nowIso = new Date().toISOString();

  /** Helper: build a complete DB row */
  const makeRow = (overrides: Record<string, unknown> = {}) => ({
    id: 'id-1',
    email: 'u@test.com',
    username: 'u1',
    password_hash: 'hash',
    role: 'buyer',
    status: 'active',
    first_name: 'First',
    last_name: 'Last',
    avatar_url: 'https://example.com/avatar.jpg',
    created_at: nowIso,
    updated_at: nowIso,
    last_login_at: nowIso,
    mfa_enabled: true,
    mfa_secret: 'ABCDEF',
    ...overrides,
  });

  let mockDb: any;
  let repo: PostgresUserRepository;
  let updateReturningMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    updateReturningMock = vi.fn().mockResolvedValue([]);

    const makeUpdateObj = () =>
      Object.assign(Promise.resolve(0), { returning: updateReturningMock });

    const qb: any = {
      where: vi.fn().mockReturnThis(),
      whereRaw: vi.fn().mockReturnThis(),
      first: vi.fn().mockResolvedValue(null),
      insert: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([]),
      update: vi.fn().mockImplementation(() => makeUpdateObj()),
      count: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue({ count: '0' }),
      }),
    };

    mockDb = vi.fn().mockReturnValue(qb);
    // expose qb so individual tests can override first/whereRaw
    mockDb._qb = qb;

    repo = new PostgresUserRepository(mockDb);
  });

  // ── findByUsername ─────────────────────────────────────────────────────────

  it('findByUsername returns mapped user when found', async () => {
    mockDb._qb.first.mockResolvedValue(makeRow());
    const res = await repo.findByUsername('u1');
    expect(res).not.toBeNull();
    expect(res?.username).toBe('u1');
    expect(mockDb._qb.whereRaw).toHaveBeenCalledWith('LOWER(username) = ?', ['u1']);
  });

  it('findByUsername lowercases the query param', async () => {
    mockDb._qb.first.mockResolvedValue(null);
    await repo.findByUsername('UPPER');
    expect(mockDb._qb.whereRaw).toHaveBeenCalledWith('LOWER(username) = ?', ['upper']);
  });

  it('findByUsername returns null when not found', async () => {
    mockDb._qb.first.mockResolvedValue(null);
    const res = await repo.findByUsername('nobody');
    expect(res).toBeNull();
  });

  // ── findByEmail – success path ─────────────────────────────────────────────

  it('findByEmail returns mapped user when found', async () => {
    mockDb._qb.first.mockResolvedValue(makeRow({ email: 'found@test.com' }));
    const res = await repo.findByEmail('FOUND@TEST.COM');
    expect(res).not.toBeNull();
    expect(mockDb._qb.whereRaw).toHaveBeenCalledWith('LOWER(email) = ?', ['found@test.com']);
  });

  // ── mapToUser – all optional fields present ────────────────────────────────

  it('mapToUser maps lastLoginAt, mfaEnabled, mfaSecret, avatarUrl', async () => {
    mockDb._qb.first.mockResolvedValue(makeRow());
    const res = await repo.findById('id-1');
    expect(res?.lastLoginAt).toBeInstanceOf(Date);
    expect(res?.mfaEnabled).toBe(true);
    expect(res?.mfaSecret).toBe('ABCDEF');
    expect(res?.avatarUrl).toBe('https://example.com/avatar.jpg');
    expect(res?.firstName).toBe('First');
    expect(res?.lastName).toBe('Last');
  });

  it('mapToUser handles null optional fields', async () => {
    mockDb._qb.first.mockResolvedValue(
      makeRow({
        first_name: null,
        last_name: null,
        avatar_url: null,
        last_login_at: null,
        mfa_enabled: false,
        mfa_secret: null,
      }),
    );
    const res = await repo.findById('id-1');
    expect(res?.firstName).toBeFalsy();
    expect(res?.lastName).toBeFalsy();
    expect(res?.avatarUrl).toBeFalsy();
    expect(res?.lastLoginAt).toBeUndefined(); // ternary returns undefined for null
    expect(res?.mfaEnabled).toBe(false);
    expect(res?.mfaSecret).toBeFalsy();
  });

  // ── update – returning a row ───────────────────────────────────────────────

  it('update returns mapped user when row is found', async () => {
    const row = makeRow({ first_name: 'Updated' });
    updateReturningMock.mockResolvedValue([row]);
    const res = await repo.update('id-1', { firstName: 'Updated' });
    expect(res).not.toBeNull();
    expect(res?.firstName).toBe('Updated');
  });

  it('update maps all optional fields: email, username, role, status, firstName, lastName, avatarUrl, lastLoginAt', async () => {
    const row = makeRow({
      email: 'new@test.com',
      username: 'newuser',
      role: 'seller',
      status: 'suspended',
    });
    updateReturningMock.mockResolvedValue([row]);
    const res = await repo.update('id-1', {
      email: 'new@test.com',
      username: 'newuser',
      role: 'seller' as any,
      status: 'suspended' as any,
      firstName: 'A',
      lastName: 'B',
      avatarUrl: 'http://cdn.example.com/pic.jpg',
      lastLoginAt: new Date(),
    });
    expect(res).not.toBeNull();
    expect(res?.role).toBe('seller');
  });

  // ── updateMfa ──────────────────────────────────────────────────────────────

  it('updateMfa enables MFA and returns updated user', async () => {
    const row = makeRow({ mfa_enabled: true, mfa_secret: 'NEWSECRET' });
    updateReturningMock.mockResolvedValue([row]);
    const res = await repo.updateMfa('id-1', true, 'NEWSECRET');
    expect(res).not.toBeNull();
    expect(res?.mfaEnabled).toBe(true);
    expect(res?.mfaSecret).toBe('NEWSECRET');
  });

  it('updateMfa disables MFA (secret = null)', async () => {
    const row = makeRow({ mfa_enabled: false, mfa_secret: null });
    updateReturningMock.mockResolvedValue([row]);
    const res = await repo.updateMfa('id-1', false, null);
    expect(res).not.toBeNull();
    expect(res?.mfaEnabled).toBe(false);
    expect(res?.mfaSecret).toBeFalsy();
  });

  it('updateMfa returns null when user not found', async () => {
    updateReturningMock.mockResolvedValue([]);
    const res = await repo.updateMfa('nonexistent', false, null);
    expect(res).toBeNull();
  });

  // ── emailExists / usernameExists – true cases ─────────────────────────────

  it('emailExists returns true when count > 0', async () => {
    mockDb._qb.count.mockReturnValue({
      first: vi.fn().mockResolvedValue({ count: '1' }),
    });
    expect(await repo.emailExists('taken@test.com')).toBe(true);
  });

  it('usernameExists returns true when count > 0', async () => {
    mockDb._qb.count.mockReturnValue({
      first: vi.fn().mockResolvedValue({ count: '2' }),
    });
    expect(await repo.usernameExists('taken')).toBe(true);
  });
});
