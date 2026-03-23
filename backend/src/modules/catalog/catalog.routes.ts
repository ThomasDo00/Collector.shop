import { FastifyInstance } from 'fastify';
import { getDatabase } from '@core/database/index.js';
import { transformSeller, parsePrice } from '../../utils/transformers.js';
import { ErrorResponses } from '../../utils/errors.js';
import { uploadFile } from '@core/storage/index.js';
import { cacheGet, cacheSet, cacheDel, cacheDelPattern } from '@core/cache/index.js';
import { activeProducts } from '@core/metrics/index.js';

const CACHE_TTL = {
  CATEGORIES: 3600,  // 1 hour — rarely changes
  PRODUCTS: 300,     // 5 minutes
  PRODUCT: 300,      // 5 minutes
} as const;

/**
 * Catalog routes - Products and Categories
 */
export async function catalogRoutes(fastify: FastifyInstance) {
  const db = getDatabase();

  // GET /api/catalog/categories - Get all categories
  fastify.get('/categories', {
    schema: {
      description: 'Get all categories',
      tags: ['Catalog'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  slug: { type: 'string' },
                  description: { type: 'string' },
                  iconUrl: { type: 'string' },
                  productCount: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
  }, async () => {
    const cacheKey = 'catalog:categories';
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return { success: true, data: JSON.parse(cached) };
    }

    const categories = await db('categories')
      .select('id', 'name', 'slug', 'description', 'icon_url as iconUrl', 'product_count as productCount')
      .orderBy('name', 'asc');

    await cacheSet(cacheKey, JSON.stringify(categories), CACHE_TTL.CATEGORIES);

    return {
      success: true,
      data: categories,
    };
  });

  // GET /api/catalog/products - Get all products with filters
  fastify.get('/products', {
    schema: {
      description: 'Get all products',
      tags: ['Catalog'],
      querystring: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          status: { type: 'string' },
          minPrice: { type: 'number' },
          maxPrice: { type: 'number' },
          condition: { type: 'string' },
          sort: { type: 'string' },
          search: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  price: { type: 'number' },
                  originalPrice: { type: 'number' },
                  imageUrl: { type: 'string' },
                  category: { type: 'string' },
                  condition: { type: 'string' },
                  status: { type: 'string' },
                  seller: { type: 'object' },
                  createdAt: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  }, async (request) => {
    const { category, status, minPrice, maxPrice, condition, sort, search } = request.query as Record<string, unknown>;

    // Build stable cache key from sorted active filters
    const activeFilters = Object.entries({ category, status, minPrice, maxPrice, condition, sort, search })
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => a.localeCompare(b));
    const cacheKey = `catalog:products:${JSON.stringify(activeFilters)}`;

    const cached = await cacheGet(cacheKey);
    if (cached) {
      return { success: true, data: JSON.parse(cached) };
    }

    let query = db('products')
      .select(
        'products.id',
        'products.title',
        'products.price',
        'products.original_price as originalPrice',
        'products.image_url as imageUrl',
        'products.category_name as category',
        'products.condition',
        'products.status',
        'products.created_at as createdAt',
        'users.id as sellerId',
        'users.username as sellerUsername'
      )
      .leftJoin('users', 'products.seller_id', 'users.id');

    // Filters
    if (category) {
      query = query.where('products.category_name', category);
    }
    if (status) {
      query = query.where('products.status', status);
    }
    if (minPrice) {
      query = query.where('products.price', '>=', minPrice);
    }
    if (maxPrice) {
      query = query.where('products.price', '<=', maxPrice);
    }
    if (condition) {
      query = query.where('products.condition', condition);
    }
    if (search) {
      query = query.where(function() {
        this.where('products.title', 'ilike', `%${search}%`)
          .orWhere('products.category_name', 'ilike', `%${search}%`);
      });
    }

    // Sort
    switch (sort) {
      case 'price_asc':
        query = query.orderBy('products.price', 'asc');
        break;
      case 'price_desc':
        query = query.orderBy('products.price', 'desc');
        break;
      case 'recent':
      default:
        query = query.orderBy('products.created_at', 'desc');
    }

    const products = await query;

    // Format response to match frontend expectations
    const formattedProducts = products.map(p => ({
      id: p.id,
      title: p.title,
      price: parsePrice(p.price),
      originalPrice: p.originalPrice ? parsePrice(p.originalPrice) : null,
      imageUrl: p.imageUrl,
      category: p.category,
      condition: p.condition,
      status: p.status,
      seller: transformSeller({
        sellerId: p.sellerId,
        sellerUsername: p.sellerUsername,
      }),
      createdAt: p.createdAt,
    }));

    await cacheSet(cacheKey, JSON.stringify(formattedProducts), CACHE_TTL.PRODUCTS);

    return {
      success: true,
      data: formattedProducts,
    };
  });

  // POST /api/catalog/upload - Upload product image (authenticated)
  fastify.post('/upload', {
    schema: {
      description: 'Upload a product image to MinIO storage',
      tags: ['Catalog'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                imageUrl: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    await request.jwtVerify();

    const data = await request.file();

    if (!data) {
      return reply.status(400).send({ success: false, error: 'No file provided' });
    }

    if (!data.mimetype.startsWith('image/')) {
      return reply.status(400).send({ success: false, error: 'File must be an image' });
    }

    const buffer = await data.toBuffer();
    const imageUrl = await uploadFile(buffer, data.filename, data.mimetype);

    return { success: true, data: { imageUrl } };
  });

  // POST /api/catalog/products - Create a product (authenticated)
  fastify.post('/products', {
    schema: {
      description: 'Create a new product listing',
      tags: ['Catalog'],
      body: {
        type: 'object',
        required: ['title', 'price', 'condition', 'categoryId', 'imageUrl'],
        properties: {
          title: { type: 'string', minLength: 3, maxLength: 255 },
          description: { type: 'string', maxLength: 2000 },
          price: { type: 'number', minimum: 0.01 },
          condition: { type: 'string', enum: ['new', 'like_new', 'very_good', 'good', 'acceptable'] },
          categoryId: { type: 'string', format: 'uuid' },
          imageUrl: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    await request.jwtVerify();
    const sellerId = (request.user as { userId: string }).userId;

    const { title, description, price, condition, categoryId, imageUrl } = request.body as {
      title: string;
      description?: string;
      price: number;
      condition: string;
      categoryId: string;
      imageUrl: string;
    };

    const category = await db('categories').where({ id: categoryId }).first();
    if (!category) {
      return reply.status(400).send({ success: false, error: 'Invalid category' });
    }

    const [product] = await db('products').insert({
      title,
      description,
      price,
      condition,
      image_url: imageUrl,
      category_id: categoryId,
      category_name: category.name,
      seller_id: sellerId,
      status: 'active',
    }).returning('*');

    activeProducts.inc();

    // Invalidate product listing cache (all filter combinations)
    await cacheDelPattern('catalog:products:*');
    await cacheDel('catalog:categories');

    return reply.status(201).send({
      success: true,
      data: {
        id: product.id,
        title: product.title,
        price: parsePrice(product.price),
        imageUrl: product.image_url,
        condition: product.condition,
        status: product.status,
        category: product.category_name,
        createdAt: product.created_at,
      },
    });
  });

  // GET /api/catalog/products/:id - Get single product
  fastify.get('/products/:id', {
    schema: {
      description: 'Get product by ID',
      tags: ['Catalog'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const cacheKey = `catalog:product:${id}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return { success: true, data: JSON.parse(cached) };
    }

    const product = await db('products')
      .select(
        'products.*',
        'users.id as sellerId',
        'users.username as sellerUsername',
        'users.avatar_url as sellerAvatar'
      )
      .leftJoin('users', 'products.seller_id', 'users.id')
      .where('products.id', id as string)
      .first();

    if (!product) {
      return ErrorResponses.productNotFound(reply);
    }

    const productData = {
      id: product.id,
      title: product.title,
      description: product.description,
      price: parsePrice(product.price),
      originalPrice: product.original_price ? parsePrice(product.original_price) : null,
      imageUrl: product.image_url,
      category: product.category_name,
      condition: product.condition,
      status: product.status,
      seller: transformSeller({
        sellerId: product.sellerId,
        sellerUsername: product.sellerUsername,
        sellerAvatar: product.sellerAvatar,
      }),
      createdAt: product.created_at,
    };

    await cacheSet(cacheKey, JSON.stringify(productData), CACHE_TTL.PRODUCT);

    return { success: true, data: productData };
  });

  // DELETE /api/catalog/products/:id - Delete a product (authenticated, owner only)
  fastify.delete('/products/:id', {
    schema: {
      description: 'Delete a product listing (owner only)',
      tags: ['Catalog'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    await request.jwtVerify();
    const { userId } = request.user as { userId: string };
    const { id } = request.params as { id: string };

    const product = await db('products').where({ id }).first();

    if (!product) {
      return ErrorResponses.productNotFound(reply);
    }

    if (product.seller_id !== userId) {
      return reply.status(403).send({
        success: false,
        error: 'FORBIDDEN',
        message: 'You are not allowed to delete this product',
      });
    }

    await db('products').where({ id }).delete();

    activeProducts.dec();

    await cacheDelPattern('catalog:products:*');
    await cacheDel(`catalog:product:${id}`);

    return reply.status(204).send();
  });
}
