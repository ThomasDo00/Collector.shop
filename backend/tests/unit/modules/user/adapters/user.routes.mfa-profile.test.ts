import Fastify from 'fastify';
import jwt from '@fastify/jwt';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Hoisted mock references
// ---------------------------------------------------------------------------
const mockUserRepo = vi.hoisted(() => ({
  findById: vi.fn(),
  update: vi.fn(),
  updateMfa: vi.fn(),
}));

const mockTotpVerify = vi.hoisted(() => vi.fn());
const mockGenerateSecret = vi.hoisted(() => vi.fn());
const mockGenerateURI = vi.hoisted(() => vi.fn());
const mockQrToDataUrl = vi.hoisted(() => vi.fn());
const mockCacheSet = vi.hoisted(() => vi.fn());

const mockDb = vi.hoisted(() => {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {
    select: vi.fn(),
    leftJoin: vi.fn(),
    where: vi.fn(),
    andWhere: vi.fn(),
    count: vi.fn(),
    orderBy: vi.fn(),
    first: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  };
  Object.keys(chain).forEach((k) => chain[k].mockReturnValue(chain));

  const dbFn = vi.fn(() => chain) as any;
  dbFn._chain = chain;
  dbFn.raw = vi.fn().mockReturnValue({});
  return dbFn;
});

// ---------------------------------------------------------------------------
// Module mocks (hoisted by Vitest before any import)
// ---------------------------------------------------------------------------
vi.mock('@modules/user/domain/usecases/RegisterUser.js', () => ({
  RegisterUser: class {
    async execute(body: any) {
      return { id: 'u1', email: body.email, username: body.username, role: 'buyer', status: 'active', createdAt: new Date(), updatedAt: new Date() };
    }
  },
  EmailAlreadyExistsError: class extends Error {},
  UsernameAlreadyExistsError: class extends Error {},
}));

vi.mock('@modules/user/domain/usecases/LoginUser.js', () => ({
  LoginUser: class {
    async execute(body: any) {
      if (body.emailOrUsername === 'mfauser') {
        return { userId: 'u-mfa', email: 'mfa@test.com', username: 'mfauser', role: 'buyer', mfaEnabled: true };
      }
      return { userId: 'u1', email: 'u@test.com', username: 'u', role: 'buyer', mfaEnabled: false };
    }
  },
  InvalidCredentialsError: class extends Error {},
  EmailNotVerifiedError: class extends Error {},
  AccountSuspendedError: class extends Error {},
  AccountBannedError: class extends Error {},
  loginCredentialsSchema: {} as any,
}));

vi.mock('@modules/user/infrastructure/PostgresUserRepository.js', () => ({
  PostgresUserRepository: vi.fn(() => mockUserRepo),
}));

vi.mock('@core/database/index.js', () => ({
  getDatabase: () => mockDb,
}));

vi.mock('@core/cache/index.js', () => ({
  cacheSet: mockCacheSet,
  cacheGet: vi.fn().mockResolvedValue(null),
  cacheDel: vi.fn(),
  cacheDelPattern: vi.fn(),
}));

vi.mock('otplib', () => ({
  verify: mockTotpVerify,
  generateSecret: mockGenerateSecret,
  generateURI: mockGenerateURI,
}));

vi.mock('qrcode', () => ({
  default: { toDataURL: mockQrToDataUrl },
}));

// ---------------------------------------------------------------------------
// Import route (after all vi.mock calls)
// ---------------------------------------------------------------------------
import { userRoutes } from '@modules/user/adapters/user.routes.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const JWT_SECRET = 'test-jwt-secret-key-minimum-32-characters-long';

function chain() {
  return mockDb._chain;
}

function resetChain() {
  const c = chain();
  Object.keys(c).forEach((k) => {
    c[k].mockReset();
    c[k].mockReturnValue(c);
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('userRoutes — MFA & Profile', () => {
  let fastify: ReturnType<typeof Fastify>;

  beforeEach(async () => {
    vi.clearAllMocks();
    resetChain();

    // Safe defaults for every test
    mockUserRepo.findById.mockResolvedValue(null);
    mockUserRepo.update.mockResolvedValue(undefined);
    mockUserRepo.updateMfa.mockResolvedValue(undefined);
    mockCacheSet.mockResolvedValue(undefined);
    mockTotpVerify.mockResolvedValue({ valid: false }); // default: invalid TOTP
    mockGenerateSecret.mockReturnValue('FAKE_SECRET_32CHARS___');
    mockGenerateURI.mockReturnValue('otpauth://totp/Collector.shop:user@test.com');
    mockQrToDataUrl.mockResolvedValue('data:image/png;base64,FAKE');

    fastify = Fastify({ logger: false });
    await fastify.register(jwt, { secret: JWT_SECRET });
    await fastify.register(userRoutes, { prefix: '/api/users' });
    await fastify.ready();
  });

  afterEach(async () => {
    await fastify.close();
  });

  // =========================================================================
  // POST /login — MFA path
  // =========================================================================
  describe('POST /api/users/login — MFA path', () => {
    it('returns mfaRequired=true and a mfaToken when user has MFA enabled', async () => {
      const res = await fastify.inject({
        method: 'POST',
        url: '/api/users/login',
        payload: { emailOrUsername: 'mfauser', password: 'pass' },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.mfaRequired).toBe(true);
      expect(body.data.mfaToken).toBeDefined();
    });
  });

  // =========================================================================
  // POST /logout
  // =========================================================================
  describe('POST /api/users/logout', () => {
    it('returns 200 with no Authorization header (token missing)', async () => {
      const res = await fastify.inject({ method: 'POST', url: '/api/users/logout' });

      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.payload).message).toBe('Logged out');
    });

    it('returns 200 with an invalid token (jwtVerify catches error)', async () => {
      const res = await fastify.inject({
        method: 'POST',
        url: '/api/users/logout',
        headers: { authorization: 'Bearer invalidtoken' },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.message).toBe('Logged out');
    });

    it('blacklists a valid token and returns 200', async () => {
      const token = fastify.jwt.sign({ userId: 'u1', role: 'buyer' }, { expiresIn: '1h' });

      const res = await fastify.inject({
        method: 'POST',
        url: '/api/users/logout',
        headers: { authorization: `Bearer ${token}` },
      });

      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.payload).message).toBe('Logged out successfully');
      expect(mockCacheSet).toHaveBeenCalledWith(
        `blacklist:${token}`,
        '1',
        expect.any(Number)
      );
    });
  });

  // =========================================================================
  // POST /mfa/verify-login
  // =========================================================================
  describe('POST /api/users/mfa/verify-login', () => {
    it('returns 401 for an invalid/expired mfaToken', async () => {
      const res = await fastify.inject({
        method: 'POST',
        url: '/api/users/mfa/verify-login',
        payload: { mfaToken: 'not-a-valid-jwt', totpCode: '123456' },
      });

      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res.payload).error).toBe('INVALID_MFA_TOKEN');
    });

    it('returns 401 when token type is not "mfa"', async () => {
      const wrongToken = fastify.jwt.sign({ userId: 'u1', type: 'access' });

      const res = await fastify.inject({
        method: 'POST',
        url: '/api/users/mfa/verify-login',
        payload: { mfaToken: wrongToken, totpCode: '123456' },
      });

      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res.payload).error).toBe('INVALID_MFA_TOKEN');
    });

    it('returns 401 when user not found', async () => {
      const mfaToken = fastify.jwt.sign({ userId: 'u1', type: 'mfa' });
      // findById defaults to null

      const res = await fastify.inject({
        method: 'POST',
        url: '/api/users/mfa/verify-login',
        payload: { mfaToken, totpCode: '123456' },
      });

      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res.payload).error).toBe('MFA_NOT_CONFIGURED');
    });

    it('returns 401 when user has mfaEnabled=false', async () => {
      const mfaToken = fastify.jwt.sign({ userId: 'u1', type: 'mfa' });
      mockUserRepo.findById.mockResolvedValue({ id: 'u1', mfaEnabled: false, mfaSecret: null });

      const res = await fastify.inject({
        method: 'POST',
        url: '/api/users/mfa/verify-login',
        payload: { mfaToken, totpCode: '123456' },
      });

      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res.payload).error).toBe('MFA_NOT_CONFIGURED');
    });

    it('returns 401 for an invalid TOTP code', async () => {
      const mfaToken = fastify.jwt.sign({ userId: 'u1', type: 'mfa' });
      mockUserRepo.findById.mockResolvedValue({
        id: 'u1', email: 'u@test.com', username: 'u', role: 'buyer',
        mfaEnabled: true, mfaSecret: 'SECRET',
      });
      // mockTotpVerify defaults to { valid: false }

      const res = await fastify.inject({
        method: 'POST',
        url: '/api/users/mfa/verify-login',
        payload: { mfaToken, totpCode: '000000' },
      });

      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res.payload).error).toBe('INVALID_TOTP');
    });

    it('exchanges mfaToken for full access tokens on success', async () => {
      const mfaToken = fastify.jwt.sign({ userId: 'u1', type: 'mfa' });
      mockUserRepo.findById.mockResolvedValue({
        id: 'u1', email: 'u@test.com', username: 'u', role: 'buyer',
        mfaEnabled: true, mfaSecret: 'SECRET',
      });
      mockTotpVerify.mockResolvedValue({ valid: true });

      const res = await fastify.inject({
        method: 'POST',
        url: '/api/users/mfa/verify-login',
        payload: { mfaToken, totpCode: '123456' },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data.accessToken).toBeDefined();
      expect(body.data.refreshToken).toBeDefined();
      expect(mockUserRepo.update).toHaveBeenCalled();
    });
  });

  // =========================================================================
  // POST /mfa/setup
  // =========================================================================
  describe('POST /api/users/mfa/setup', () => {
    it('returns 401 without authentication', async () => {
      const res = await fastify.inject({ method: 'POST', url: '/api/users/mfa/setup' });
      expect(res.statusCode).toBe(401);
    });

    it('returns 404 when user not found', async () => {
      const token = fastify.jwt.sign({ userId: 'ghost' });

      const res = await fastify.inject({
        method: 'POST',
        url: '/api/users/mfa/setup',
        headers: { authorization: `Bearer ${token}` },
      });

      expect(res.statusCode).toBe(404);
    });

    it('returns secret and QR code on success', async () => {
      const token = fastify.jwt.sign({ userId: 'u1' });
      mockUserRepo.findById.mockResolvedValue({ id: 'u1', email: 'u@test.com' });

      const res = await fastify.inject({
        method: 'POST',
        url: '/api/users/mfa/setup',
        headers: { authorization: `Bearer ${token}` },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.data.secret).toBe('FAKE_SECRET_32CHARS___');
      expect(body.data.qrCode).toBe('data:image/png;base64,FAKE');
      expect(body.data.mfaEnabled).toBe(false);
      expect(mockUserRepo.updateMfa).toHaveBeenCalledWith('u1', false, 'FAKE_SECRET_32CHARS___');
    });
  });

  // =========================================================================
  // POST /mfa/enable
  // =========================================================================
  describe('POST /api/users/mfa/enable', () => {
    it('returns 401 without authentication', async () => {
      const res = await fastify.inject({
        method: 'POST',
        url: '/api/users/mfa/enable',
        payload: { totpCode: '123456' },
      });
      expect(res.statusCode).toBe(401);
    });

    it('returns 400 when MFA has not been set up (no mfaSecret)', async () => {
      const token = fastify.jwt.sign({ userId: 'u1' });
      mockUserRepo.findById.mockResolvedValue({ id: 'u1', mfaSecret: null, mfaEnabled: false });

      const res = await fastify.inject({
        method: 'POST',
        url: '/api/users/mfa/enable',
        headers: { authorization: `Bearer ${token}` },
        payload: { totpCode: '123456' },
      });

      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.payload).error).toBe('MFA_NOT_SETUP');
    });

    it('returns 400 when MFA is already enabled', async () => {
      const token = fastify.jwt.sign({ userId: 'u1' });
      mockUserRepo.findById.mockResolvedValue({ id: 'u1', mfaSecret: 'S', mfaEnabled: true });

      const res = await fastify.inject({
        method: 'POST',
        url: '/api/users/mfa/enable',
        headers: { authorization: `Bearer ${token}` },
        payload: { totpCode: '123456' },
      });

      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.payload).error).toBe('MFA_ALREADY_ENABLED');
    });

    it('returns 401 for invalid TOTP', async () => {
      const token = fastify.jwt.sign({ userId: 'u1' });
      mockUserRepo.findById.mockResolvedValue({ id: 'u1', mfaSecret: 'SECRET', mfaEnabled: false });
      // mockTotpVerify defaults to { valid: false }

      const res = await fastify.inject({
        method: 'POST',
        url: '/api/users/mfa/enable',
        headers: { authorization: `Bearer ${token}` },
        payload: { totpCode: '000000' },
      });

      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res.payload).error).toBe('INVALID_TOTP');
    });

    it('enables MFA on success', async () => {
      const token = fastify.jwt.sign({ userId: 'u1' });
      mockUserRepo.findById.mockResolvedValue({ id: 'u1', mfaSecret: 'SECRET', mfaEnabled: false });
      mockTotpVerify.mockResolvedValue({ valid: true });

      const res = await fastify.inject({
        method: 'POST',
        url: '/api/users/mfa/enable',
        headers: { authorization: `Bearer ${token}` },
        payload: { totpCode: '123456' },
      });

      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.payload).data.mfaEnabled).toBe(true);
      expect(mockUserRepo.updateMfa).toHaveBeenCalledWith('u1', true, 'SECRET');
    });
  });

  // =========================================================================
  // POST /mfa/disable
  // =========================================================================
  describe('POST /api/users/mfa/disable', () => {
    it('returns 401 without authentication', async () => {
      const res = await fastify.inject({
        method: 'POST',
        url: '/api/users/mfa/disable',
        payload: { totpCode: '123456' },
      });
      expect(res.statusCode).toBe(401);
    });

    it('returns 400 when MFA is not enabled', async () => {
      const token = fastify.jwt.sign({ userId: 'u1' });
      mockUserRepo.findById.mockResolvedValue({ id: 'u1', mfaEnabled: false, mfaSecret: null });

      const res = await fastify.inject({
        method: 'POST',
        url: '/api/users/mfa/disable',
        headers: { authorization: `Bearer ${token}` },
        payload: { totpCode: '123456' },
      });

      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.payload).error).toBe('MFA_NOT_ENABLED');
    });

    it('returns 401 for invalid TOTP', async () => {
      const token = fastify.jwt.sign({ userId: 'u1' });
      mockUserRepo.findById.mockResolvedValue({ id: 'u1', mfaEnabled: true, mfaSecret: 'SECRET' });
      // mockTotpVerify defaults to { valid: false }

      const res = await fastify.inject({
        method: 'POST',
        url: '/api/users/mfa/disable',
        headers: { authorization: `Bearer ${token}` },
        payload: { totpCode: '000000' },
      });

      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res.payload).error).toBe('INVALID_TOTP');
    });

    it('disables MFA on success', async () => {
      const token = fastify.jwt.sign({ userId: 'u1' });
      mockUserRepo.findById.mockResolvedValue({ id: 'u1', mfaEnabled: true, mfaSecret: 'SECRET' });
      mockTotpVerify.mockResolvedValue({ valid: true });

      const res = await fastify.inject({
        method: 'POST',
        url: '/api/users/mfa/disable',
        headers: { authorization: `Bearer ${token}` },
        payload: { totpCode: '123456' },
      });

      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.payload).data.mfaEnabled).toBe(false);
      expect(mockUserRepo.updateMfa).toHaveBeenCalledWith('u1', false, null);
    });
  });

  // =========================================================================
  // GET /profile/:username
  // =========================================================================
  describe('GET /api/users/profile/:username', () => {
    it('returns 404 when user does not exist', async () => {
      chain().first.mockResolvedValue(null);

      const res = await fastify.inject({ method: 'GET', url: '/api/users/profile/unknown' });

      expect(res.statusCode).toBe(404);
      expect(JSON.parse(res.payload).error).toBe('USER_NOT_FOUND');
    });

    it('returns profile with stats when user exists', async () => {
      chain().first
        .mockResolvedValueOnce({ id: 'u1', username: 'john', email: 'j@test.com', status: 'active' })
        .mockResolvedValueOnce({ count: '5' })             // salesCount
        .mockResolvedValueOnce({ count: '3', average_rating: '4.5' }); // reviews

      const res = await fastify.inject({ method: 'GET', url: '/api/users/profile/john' });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data.username).toBe('john');
      expect(body.data.salesCount).toBe(5);
      expect(body.data.reviewCount).toBe(3);
      expect(body.data.rating).toBe(4.5);
      expect(body.data.isVerified).toBe(true);
    });

    it('returns rating=0 when user has no reviews', async () => {
      chain().first
        .mockResolvedValueOnce({ id: 'u1', username: 'john', email: 'j@test.com', status: 'active' })
        .mockResolvedValueOnce({ count: '0' })
        .mockResolvedValueOnce({ count: '0', average_rating: null });

      const res = await fastify.inject({ method: 'GET', url: '/api/users/profile/john' });

      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.payload).data.rating).toBe(0);
    });
  });

  // =========================================================================
  // GET /profile/:username/listings
  // =========================================================================
  describe('GET /api/users/profile/:username/listings', () => {
    it('returns 404 when user does not exist', async () => {
      chain().first.mockResolvedValue(null);

      const res = await fastify.inject({
        method: 'GET',
        url: '/api/users/profile/nobody/listings',
      });

      expect(res.statusCode).toBe(404);
      expect(JSON.parse(res.payload).error).toBe('USER_NOT_FOUND');
    });

    it('returns product listings for the user', async () => {
      chain().first.mockResolvedValue({ id: 'u1' });
      chain().orderBy.mockResolvedValue([
        { id: 'p1', title: 'Jordan 1', price: '120.00', imageUrl: 'http://img', category: 'Sneakers', condition: 'new', status: 'active', createdAt: '2024-01-01', 'seller.id': 'u1', 'seller.username': 'john' },
      ]);

      const res = await fastify.inject({
        method: 'GET',
        url: '/api/users/profile/john/listings',
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(1);
      expect(body.data[0].price).toBe(120);
    });

    it('passes status filter to the query', async () => {
      chain().first.mockResolvedValue({ id: 'u1' });
      chain().orderBy.mockResolvedValue([]);

      await fastify.inject({
        method: 'GET',
        url: '/api/users/profile/john/listings?status=sold',
      });

      expect(chain().where).toHaveBeenCalledWith('products.status', 'sold');
    });
  });

  // =========================================================================
  // GET /profile/:username/reviews
  // =========================================================================
  describe('GET /api/users/profile/:username/reviews', () => {
    it('returns 404 when user does not exist', async () => {
      chain().first.mockResolvedValue(null);

      const res = await fastify.inject({
        method: 'GET',
        url: '/api/users/profile/nobody/reviews',
      });

      expect(res.statusCode).toBe(404);
      expect(JSON.parse(res.payload).error).toBe('USER_NOT_FOUND');
    });

    it('returns formatted reviews for the user', async () => {
      chain().first.mockResolvedValue({ id: 'u1' });
      chain().orderBy.mockResolvedValue([
        {
          id: 'r1',
          rating: 5,
          comment: 'Excellent!',
          createdAt: '2024-01-01',
          'author.username': 'buyer1',
          'author.avatarUrl': 'http://avatar',
        },
      ]);

      const res = await fastify.inject({
        method: 'GET',
        url: '/api/users/profile/john/reviews',
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(1);
      expect(body.data[0].author.username).toBe('buyer1');
      expect(body.data[0].rating).toBe(5);
    });
  });
});
