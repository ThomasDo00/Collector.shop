import Fastify from 'fastify';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Hoisted mocks
// ---------------------------------------------------------------------------
const mockDb = vi.hoisted(() => {
  const chain = {
    select: vi.fn(),
    leftJoin: vi.fn(),
    where: vi.fn(),
    first: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    del: vi.fn(),
  };
  Object.keys(chain).forEach((k) => {
    (chain as any)[k].mockReturnValue(chain);
  });

  const dbFn = vi.fn(() => chain) as any;
  dbFn._chain = chain;
  return dbFn;
});

vi.mock('@core/database/index.js', () => ({
  getDatabase: () => mockDb,
}));

// ---------------------------------------------------------------------------
// Import route after mocks are in place
// ---------------------------------------------------------------------------
import { cartRoutes } from '@modules/cart/cart.routes.js';

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

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('cartRoutes', () => {
  let fastify: ReturnType<typeof Fastify>;

  beforeEach(async () => {
    vi.clearAllMocks();
    resetChain();

    fastify = Fastify({ logger: false });
    await fastify.register(cartRoutes, { prefix: '/api/cart' });
    await fastify.ready();
  });

  afterEach(async () => {
    await fastify.close();
  });

  // -------------------------------------------------------------------------
  // GET /:userId
  // -------------------------------------------------------------------------
  describe('GET /api/cart/:userId', () => {
    it('returns empty cart when no items exist', async () => {
      chain().where.mockResolvedValue([]);

      const res = await fastify.inject({ method: 'GET', url: '/api/cart/user-1' });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data.items).toEqual([]);
      expect(body.data.subtotal).toBe(0);
      expect(body.data.total).toBe(0);
    });

    it('returns cart with calculated totals', async () => {
      const fakeItems = [
        {
          id: 'item-1',
          productId: 'prod-1',
          title: 'Jordan 1',
          price: '100.00',
          imageUrl: 'http://img',
          'seller.username': 'john',
          quantity: '2',
        },
      ];
      chain().where.mockResolvedValue(fakeItems);

      const res = await fastify.inject({ method: 'GET', url: '/api/cart/user-1' });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data.items).toHaveLength(1);
      expect(body.data.items[0].title).toBe('Jordan 1');
      expect(body.data.items[0].price).toBe(100);
      expect(body.data.items[0].quantity).toBe(2);

      // subtotal = 100 * 2 = 200
      expect(body.data.subtotal).toBe(200);
      // commission = 200 * 0.05 = 10
      expect(body.data.commission).toBe(10);
      // shipping = 8.90
      expect(body.data.shipping).toBe(8.9);
      // total = 200 + 10 + 8.90 = 218.90
      expect(body.data.total).toBe(218.9);
    });

    it('rounds monetary values to 2 decimal places', async () => {
      const fakeItems = [
        {
          id: 'item-1',
          productId: 'prod-1',
          title: 'Item',
          price: '33.33',
          imageUrl: null,
          'seller.username': 'seller',
          quantity: '1',
        },
      ];
      chain().where.mockResolvedValue(fakeItems);

      const res = await fastify.inject({ method: 'GET', url: '/api/cart/user-1' });

      const body = JSON.parse(res.payload);
      // commission = 33.33 * 0.05 = 1.6665 → rounded to 1.67
      expect(body.data.commission).toBe(1.67);
      // total = 33.33 + 1.67 + 8.90 = 43.90
      expect(body.data.total).toBe(43.9);
    });
  });

  // -------------------------------------------------------------------------
  // POST /:userId/items
  // -------------------------------------------------------------------------
  describe('POST /api/cart/:userId/items', () => {
    it('returns 404 when product does not exist', async () => {
      chain().first.mockResolvedValue(null);

      const res = await fastify.inject({
        method: 'POST',
        url: '/api/cart/user-1/items',
        payload: { productId: 'nonexistent' },
      });

      expect(res.statusCode).toBe(404);
      const body = JSON.parse(res.payload);
      expect(body.error).toBe('PRODUCT_NOT_FOUND');
    });

    it('inserts new item when not already in cart', async () => {
      const fakeProduct = { id: 'prod-1', title: 'Jordan 1' };
      // First first() → product lookup → found
      // Second first() → cart_items lookup → not found
      chain().first
        .mockResolvedValueOnce(fakeProduct)
        .mockResolvedValueOnce(null);

      const res = await fastify.inject({
        method: 'POST',
        url: '/api/cart/user-1/items',
        payload: { productId: 'prod-1', quantity: 1 },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.message).toBe('Item added to cart');
      expect(chain().insert).toHaveBeenCalledWith({
        user_id: 'user-1',
        product_id: 'prod-1',
        quantity: 1,
      });
    });

    it('updates quantity when item already in cart', async () => {
      const fakeProduct = { id: 'prod-1', title: 'Jordan 1' };
      const existingItem = { id: 'item-1', user_id: 'user-1', product_id: 'prod-1', quantity: 1 };
      chain().first
        .mockResolvedValueOnce(fakeProduct)
        .mockResolvedValueOnce(existingItem);

      const res = await fastify.inject({
        method: 'POST',
        url: '/api/cart/user-1/items',
        payload: { productId: 'prod-1', quantity: 3 },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(chain().update).toHaveBeenCalledWith(
        expect.objectContaining({ quantity: 3 })
      );
    });

    it('defaults quantity to 1 when not provided', async () => {
      const fakeProduct = { id: 'prod-1' };
      chain().first
        .mockResolvedValueOnce(fakeProduct)
        .mockResolvedValueOnce(null);

      await fastify.inject({
        method: 'POST',
        url: '/api/cart/user-1/items',
        payload: { productId: 'prod-1' },
      });

      expect(chain().insert).toHaveBeenCalledWith(
        expect.objectContaining({ quantity: 1 })
      );
    });
  });

  // -------------------------------------------------------------------------
  // DELETE /:userId/items/:itemId
  // -------------------------------------------------------------------------
  describe('DELETE /api/cart/:userId/items/:itemId', () => {
    it('removes item and returns success', async () => {
      chain().del.mockResolvedValue(1);

      const res = await fastify.inject({
        method: 'DELETE',
        url: '/api/cart/user-1/items/item-1',
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.message).toBe('Item removed from cart');
    });

    it('returns 404 when item not found', async () => {
      chain().del.mockResolvedValue(0);

      const res = await fastify.inject({
        method: 'DELETE',
        url: '/api/cart/user-1/items/nonexistent',
      });

      expect(res.statusCode).toBe(404);
      const body = JSON.parse(res.payload);
      expect(body.error).toBe('ITEM_NOT_FOUND');
    });
  });

  // -------------------------------------------------------------------------
  // DELETE /:userId
  // -------------------------------------------------------------------------
  describe('DELETE /api/cart/:userId', () => {
    it('clears entire cart', async () => {
      chain().del.mockResolvedValue(5);

      const res = await fastify.inject({
        method: 'DELETE',
        url: '/api/cart/user-1',
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.message).toBe('Cart cleared');
      expect(chain().where).toHaveBeenCalledWith('user_id', 'user-1');
    });
  });
});
