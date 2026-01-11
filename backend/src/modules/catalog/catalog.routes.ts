import { FastifyInstance } from 'fastify';
import { getDatabase } from '@core/database/index.js';

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
    const categories = await db('categories')
      .select('id', 'name', 'slug', 'description', 'icon_url as iconUrl', 'product_count as productCount')
      .orderBy('name', 'asc');

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
    const { category, status, minPrice, maxPrice, condition, sort, search } = request.query as any;

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
      price: parseFloat(p.price),
      originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : null,
      imageUrl: p.imageUrl,
      category: p.category,
      condition: p.condition,
      status: p.status,
      seller: {
        id: p.sellerId,
        username: p.sellerUsername,
        rating: 4.8, // TODO: Calculate real rating
      },
      createdAt: p.createdAt,
    }));

    return {
      success: true,
      data: formattedProducts,
    };
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
    const { id } = request.params as any;

    const product = await db('products')
      .select(
        'products.*',
        'users.id as sellerId',
        'users.username as sellerUsername',
        'users.avatar_url as sellerAvatar'
      )
      .leftJoin('users', 'products.seller_id', 'users.id')
      .where('products.id', id)
      .first();

    if (!product) {
      return reply.status(404).send({
        success: false,
        error: 'PRODUCT_NOT_FOUND',
        message: 'Product not found',
      });
    }

    return {
      success: true,
      data: {
        id: product.id,
        title: product.title,
        description: product.description,
        price: parseFloat(product.price),
        originalPrice: product.original_price ? parseFloat(product.original_price) : null,
        imageUrl: product.image_url,
        category: product.category_name,
        condition: product.condition,
        status: product.status,
        seller: {
          id: product.sellerId,
          username: product.sellerUsername,
          avatarUrl: product.sellerAvatar,
          rating: 4.8,
        },
        createdAt: product.created_at,
      },
    };
  });
}
