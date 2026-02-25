import Fastify from 'fastify';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Hoisted mocks — must be declared before any import that pulls in the module
// ---------------------------------------------------------------------------
const mockDb = vi.hoisted(() => {
  const chain = {
    select: vi.fn(),
    leftJoin: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    first: vi.fn(),
    insert: vi.fn(),
    returning: vi.fn(),
  };
  // Make every method return `chain` so calls can be chained
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

vi.mock('@core/cache/index.js', () => ({
  cacheGet: vi.fn(),
  cacheSet: vi.fn(),
  cacheDel: vi.fn(),
  cacheDelPattern: vi.fn(),
}));

vi.mock('@core/storage/index.js', () => ({
  uploadFile: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Now safe to import the route under test (deps already mocked)
// ---------------------------------------------------------------------------
import { catalogRoutes } from '@modules/catalog/catalog.routes.js';
import { cacheGet, cacheSet, cacheDel, cacheDelPattern } from '@core/cache/index.js';
import { uploadFile } from '@core/storage/index.js';

const mockCacheGet = vi.mocked(cacheGet);
const mockCacheSet = vi.mocked(cacheSet);
const mockCacheDel = vi.mocked(cacheDel);
const mockCacheDelPattern = vi.mocked(cacheDelPattern);
const mockUploadFile = vi.mocked(uploadFile);

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
describe('catalogRoutes', () => {
  let fastify: ReturnType<typeof Fastify>;

  beforeEach(async () => {
    vi.clearAllMocks();
    resetChain();

    fastify = Fastify({ logger: false });
    await fastify.register(jwt, { secret: 'test-secret-32-chars-minimum-ok!' });
    await fastify.register(multipart);
    await fastify.register(catalogRoutes, { prefix: '/api/catalog' });
    await fastify.ready();
  });

  afterEach(async () => {
    await fastify.close();
  });

  // -------------------------------------------------------------------------
  // GET /categories
  // -------------------------------------------------------------------------
  describe('GET /api/catalog/categories', () => {
    it('returns categories from DB and caches them (cache miss)', async () => {
      mockCacheGet.mockResolvedValue(null);
      const fakeCategories = [
        { id: 'cat-1', name: 'Sneakers', slug: 'sneakers', description: 'Cool sneakers', iconUrl: 'http://icon', productCount: 5 },
      ];
      chain().orderBy.mockResolvedValue(fakeCategories);

      const res = await fastify.inject({ method: 'GET', url: '/api/catalog/categories' });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(fakeCategories);
      expect(mockCacheSet).toHaveBeenCalledWith('catalog:categories', JSON.stringify(fakeCategories), 3600);
    });

    it('returns categories from cache (cache hit)', async () => {
      const cached = [{ id: 'cat-1', name: 'Sneakers', slug: 'sneakers' }];
      mockCacheGet.mockResolvedValue(JSON.stringify(cached));

      const res = await fastify.inject({ method: 'GET', url: '/api/catalog/categories' });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.data).toEqual(cached);
      // DB should NOT have been queried
      expect(chain().orderBy).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // GET /products
  // -------------------------------------------------------------------------
  describe('GET /api/catalog/products', () => {
    it('returns products from DB (cache miss, no filters)', async () => {
      mockCacheGet.mockResolvedValue(null);
      const fakeProducts = [
        {
          id: 'p1',
          title: 'Jordan 1',
          price: '150.00',
          originalPrice: null,
          imageUrl: 'http://img',
          category: 'Sneakers',
          condition: 'new',
          status: 'active',
          sellerId: 'seller-1',
          sellerUsername: 'john',
          createdAt: new Date().toISOString(),
        },
      ];
      chain().orderBy.mockResolvedValue(fakeProducts);

      const res = await fastify.inject({ method: 'GET', url: '/api/catalog/products' });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data[0].title).toBe('Jordan 1');
      expect(body.data[0].price).toBe(150);
      // seller is typed as { type: 'object' } without listed properties in the schema,
      // so Fastify's serializer returns it as-is (an object); just verify it exists
      expect(body.data[0].seller).toBeDefined();
      expect(mockCacheSet).toHaveBeenCalled();
    });

    it('returns products from cache (cache hit)', async () => {
      const cached = [{ id: 'p1', title: 'Cached Product' }];
      mockCacheGet.mockResolvedValue(JSON.stringify(cached));

      const res = await fastify.inject({ method: 'GET', url: '/api/catalog/products' });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.data).toEqual(cached);
      expect(chain().orderBy).not.toHaveBeenCalled();
    });

    it('applies category filter', async () => {
      mockCacheGet.mockResolvedValue(null);
      chain().orderBy.mockResolvedValue([]);

      await fastify.inject({ method: 'GET', url: '/api/catalog/products?category=Sneakers' });

      expect(chain().where).toHaveBeenCalledWith('products.category_name', 'Sneakers');
    });

    it('orders by price_asc when sort=price_asc', async () => {
      mockCacheGet.mockResolvedValue(null);
      chain().orderBy.mockResolvedValue([]);

      await fastify.inject({ method: 'GET', url: '/api/catalog/products?sort=price_asc' });

      expect(chain().orderBy).toHaveBeenCalledWith('products.price', 'asc');
    });

    it('orders by price_desc when sort=price_desc', async () => {
      mockCacheGet.mockResolvedValue(null);
      chain().orderBy.mockResolvedValue([]);

      await fastify.inject({ method: 'GET', url: '/api/catalog/products?sort=price_desc' });

      expect(chain().orderBy).toHaveBeenCalledWith('products.price', 'desc');
    });
  });

  // -------------------------------------------------------------------------
  // GET /products/:id
  // -------------------------------------------------------------------------
  describe('GET /api/catalog/products/:id', () => {
    it('returns product from DB (cache miss)', async () => {
      mockCacheGet.mockResolvedValue(null);
      const fakeProduct = {
        id: 'p1',
        title: 'Jordan 1',
        description: 'Nice shoe',
        price: '150.00',
        original_price: null,
        image_url: 'http://img',
        category_name: 'Sneakers',
        condition: 'new',
        status: 'active',
        sellerId: 'seller-1',
        sellerUsername: 'john',
        sellerAvatar: null,
        created_at: new Date().toISOString(),
      };
      chain().first.mockResolvedValue(fakeProduct);

      const res = await fastify.inject({ method: 'GET', url: '/api/catalog/products/p1' });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data.title).toBe('Jordan 1');
      expect(body.data.price).toBe(150);
      expect(mockCacheSet).toHaveBeenCalledWith('catalog:product:p1', expect.any(String), 300);
    });

    it('returns product from cache (cache hit)', async () => {
      const cached = { id: 'p1', title: 'Cached' };
      mockCacheGet.mockResolvedValue(JSON.stringify(cached));

      const res = await fastify.inject({ method: 'GET', url: '/api/catalog/products/p1' });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.data).toEqual(cached);
      expect(chain().first).not.toHaveBeenCalled();
    });

    it('returns 404 when product not found', async () => {
      mockCacheGet.mockResolvedValue(null);
      chain().first.mockResolvedValue(null);

      const res = await fastify.inject({ method: 'GET', url: '/api/catalog/products/nonexistent' });

      expect(res.statusCode).toBe(404);
      const body = JSON.parse(res.payload);
      expect(body.error).toBe('PRODUCT_NOT_FOUND');
    });
  });

  // -------------------------------------------------------------------------
  // POST /products
  // -------------------------------------------------------------------------
  describe('POST /api/catalog/products', () => {
    const validBody = {
      title: 'My Product',
      price: 99.99,
      condition: 'new',
      categoryId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      imageUrl: 'http://img/photo.jpg',
    };

    it('returns 401 when not authenticated', async () => {
      const res = await fastify.inject({
        method: 'POST',
        url: '/api/catalog/products',
        payload: validBody,
      });

      expect(res.statusCode).toBe(401);
    });

    it('returns 400 when category does not exist', async () => {
      const token = fastify.jwt.sign({ id: 'user-1', role: 'seller' });
      // category lookup returns null
      chain().first.mockResolvedValue(null);

      const res = await fastify.inject({
        method: 'POST',
        url: '/api/catalog/products',
        headers: { authorization: `Bearer ${token}` },
        payload: validBody,
      });

      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.payload);
      expect(body.error).toBe('Invalid category');
    });

    it('creates product and invalidates cache', async () => {
      const token = fastify.jwt.sign({ id: 'user-1', role: 'seller' });
      const fakeCategory = { id: validBody.categoryId, name: 'Sneakers' };
      const fakeProduct = {
        id: 'new-p',
        title: 'My Product',
        price: '99.99',
        image_url: validBody.imageUrl,
        condition: 'new',
        status: 'active',
        category_name: 'Sneakers',
        created_at: new Date().toISOString(),
      };

      // first() → category lookup
      chain().first.mockResolvedValueOnce(fakeCategory);
      // returning() → insert result
      chain().returning.mockResolvedValue([fakeProduct]);

      const res = await fastify.inject({
        method: 'POST',
        url: '/api/catalog/products',
        headers: { authorization: `Bearer ${token}` },
        payload: validBody,
      });

      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.data.title).toBe('My Product');
      expect(body.data.price).toBe(99.99);
      expect(mockCacheDelPattern).toHaveBeenCalledWith('catalog:products:*');
      expect(mockCacheDel).toHaveBeenCalledWith('catalog:categories');
    });
  });

  // -------------------------------------------------------------------------
  // POST /upload
  // -------------------------------------------------------------------------
  describe('POST /api/catalog/upload', () => {
    it('returns 401 when not authenticated', async () => {
      const res = await fastify.inject({
        method: 'POST',
        url: '/api/catalog/upload',
      });

      expect(res.statusCode).toBe(401);
    });

    it('returns uploaded image URL when authenticated', async () => {
      const token = fastify.jwt.sign({ id: 'user-1', role: 'seller' });
      mockUploadFile.mockResolvedValue('http://localhost:9000/collector-images/photo.jpg');

      const boundary = '---boundary';
      const body = [
        `--${boundary}`,
        'Content-Disposition: form-data; name="file"; filename="photo.jpg"',
        'Content-Type: image/jpeg',
        '',
        'fake-image-data',
        `--${boundary}--`,
      ].join('\r\n');

      const res = await fastify.inject({
        method: 'POST',
        url: '/api/catalog/upload',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': `multipart/form-data; boundary=${boundary}`,
        },
        payload: body,
      });

      expect(res.statusCode).toBe(200);
      const resBody = JSON.parse(res.payload);
      expect(resBody.success).toBe(true);
      expect(resBody.data.imageUrl).toBe('http://localhost:9000/collector-images/photo.jpg');
    });
  });
});
