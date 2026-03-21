import Fastify from 'fastify';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Hoisted mocks
// ---------------------------------------------------------------------------
const mockDb = vi.hoisted(() => {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {
    select: vi.fn(),
    leftJoin: vi.fn(),
    where: vi.fn(),
    first: vi.fn(),
    insert: vi.fn(),
    onConflict: vi.fn(),
    ignore: vi.fn(),
    del: vi.fn(),
    orderBy: vi.fn(),
  };
  Object.keys(chain).forEach((k) => {
    chain[k].mockReturnValue(chain);
  });

  const dbFn = vi.fn(() => chain) as ReturnType<typeof vi.fn> & { _chain: typeof chain };
  dbFn._chain = chain;
  return dbFn;
});

vi.mock('@core/database/index.js', () => ({
  getDatabase: () => mockDb,
}));

import { favoritesRoutes } from '@modules/favorites/favorites.routes.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
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

const VALID_TOKEN = 'Bearer valid-token';
const USER_ID = 'user-uuid-1';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('favoritesRoutes', () => {
  let fastify: ReturnType<typeof Fastify>;

  beforeEach(async () => {
    vi.clearAllMocks();
    resetChain();

    fastify = Fastify({ logger: false });

    // Mock JWT verification
    fastify.decorate('jwt', {
      sign: vi.fn(() => 'token'),
      verify: vi.fn(() => ({ userId: USER_ID })),
    });
    fastify.decorateRequest('jwtVerify', async function (this: { headers: { authorization?: string } }) {
      if (!this.headers.authorization) {
        throw { statusCode: 401, message: 'Unauthorized' };
      }
      (this as unknown as Record<string, unknown>).user = { userId: USER_ID };
    });

    await fastify.register(favoritesRoutes, { prefix: '/api/favorites' });
    await fastify.ready();
  });

  afterEach(async () => {
    await fastify.close();
  });

  // -------------------------------------------------------------------------
  // GET /api/favorites
  // -------------------------------------------------------------------------
  describe('GET /api/favorites', () => {
    it('returns 401 when not authenticated', async () => {
      const res = await fastify.inject({ method: 'GET', url: '/api/favorites' });
      expect(res.statusCode).toBe(401);
    });

    it('returns empty array when user has no favorites', async () => {
      chain().orderBy.mockResolvedValue([]);

      const res = await fastify.inject({
        method: 'GET',
        url: '/api/favorites',
        headers: { authorization: VALID_TOKEN },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data).toEqual([]);
    });

    it('returns formatted favorites with seller info', async () => {
      const fakeRows = [
        {
          id: 'prod-1',
          title: 'Jordan 1',
          price: '120.00',
          imageUrl: 'http://img/jordan.jpg',
          category: 'Sneakers',
          condition: 'like_new',
          status: 'active',
          createdAt: '2024-01-15T00:00:00Z',
          'seller.id': 'seller-1',
          'seller.username': 'john',
          'seller.avatarUrl': null,
        },
      ];
      chain().orderBy.mockResolvedValue(fakeRows);

      const res = await fastify.inject({
        method: 'GET',
        url: '/api/favorites',
        headers: { authorization: VALID_TOKEN },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.data).toHaveLength(1);
      expect(body.data[0].title).toBe('Jordan 1');
      expect(body.data[0].price).toBe(120);
      expect(body.data[0].isFavorite).toBe(true);
      expect(body.data[0].seller.username).toBe('john');
    });
  });

  // -------------------------------------------------------------------------
  // POST /api/favorites
  // -------------------------------------------------------------------------
  describe('POST /api/favorites', () => {
    it('returns 401 when not authenticated', async () => {
      const res = await fastify.inject({
        method: 'POST',
        url: '/api/favorites',
        payload: { productId: 'prod-1' },
      });
      expect(res.statusCode).toBe(401);
    });

    it('returns 400 when productId is missing', async () => {
      const res = await fastify.inject({
        method: 'POST',
        url: '/api/favorites',
        headers: { authorization: VALID_TOKEN },
        payload: {},
      });
      expect(res.statusCode).toBe(400);
    });

    it('returns 404 when product does not exist', async () => {
      chain().first.mockResolvedValue(null);

      const res = await fastify.inject({
        method: 'POST',
        url: '/api/favorites',
        headers: { authorization: VALID_TOKEN },
        payload: { productId: 'nonexistent' },
      });

      expect(res.statusCode).toBe(404);
      const body = JSON.parse(res.payload);
      expect(body.error).toBe('PRODUCT_NOT_FOUND');
    });

    it('adds product to favorites and returns success', async () => {
      chain().first.mockResolvedValue({ id: 'prod-1', title: 'Jordan 1' });
      chain().ignore.mockResolvedValue(1);

      const res = await fastify.inject({
        method: 'POST',
        url: '/api/favorites',
        headers: { authorization: VALID_TOKEN },
        payload: { productId: 'prod-1' },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.message).toBe('Added to favorites');
    });

    it('is idempotent — does not error when already a favorite', async () => {
      chain().first.mockResolvedValue({ id: 'prod-1' });
      // onConflict().ignore() returns 0 rows affected but no error
      chain().ignore.mockResolvedValue(0);

      const res = await fastify.inject({
        method: 'POST',
        url: '/api/favorites',
        headers: { authorization: VALID_TOKEN },
        payload: { productId: 'prod-1' },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // DELETE /api/favorites/:productId
  // -------------------------------------------------------------------------
  describe('DELETE /api/favorites/:productId', () => {
    it('returns 401 when not authenticated', async () => {
      const res = await fastify.inject({
        method: 'DELETE',
        url: '/api/favorites/prod-1',
      });
      expect(res.statusCode).toBe(401);
    });

    it('removes product from favorites and returns 204', async () => {
      chain().del.mockResolvedValue(1);

      const res = await fastify.inject({
        method: 'DELETE',
        url: '/api/favorites/prod-1',
        headers: { authorization: VALID_TOKEN },
      });

      expect(res.statusCode).toBe(204);
      expect(chain().del).toHaveBeenCalled();
    });

    it('returns 204 even if product was not in favorites (idempotent)', async () => {
      chain().del.mockResolvedValue(0);

      const res = await fastify.inject({
        method: 'DELETE',
        url: '/api/favorites/nonexistent',
        headers: { authorization: VALID_TOKEN },
      });

      expect(res.statusCode).toBe(204);
    });
  });
});
