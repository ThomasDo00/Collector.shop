import type { FastifyInstance } from 'fastify';
import { getDatabase } from '@core/database/index.js';
import { parsePrice } from '../../utils/transformers.js';

/**
 * Favorites routes - requires authentication for all routes
 */
export async function favoritesRoutes(fastify: FastifyInstance) {
  const db = getDatabase();

  /**
   * GET /api/favorites
   * Get all favorites for the authenticated user
   */
  fastify.get('/', async (request, reply) => {
    await request.jwtVerify();
    const { userId } = request.user as { userId: string };

    const favorites = await db('favorites')
      .select(
        'products.id',
        'products.title',
        'products.price',
        'products.image_url as imageUrl',
        'products.category_name as category',
        'products.condition',
        'products.status',
        'products.created_at as createdAt',
        'users.id as seller.id',
        'users.username as seller.username',
        'users.avatar_url as seller.avatarUrl',
        'favorites.created_at as favoritedAt',
      )
      .leftJoin('products', 'favorites.product_id', 'products.id')
      .leftJoin('users', 'products.seller_id', 'users.id')
      .where('favorites.user_id', userId)
      .orderBy('favorites.created_at', 'desc');

    const formattedFavorites = favorites.map((item: Record<string, unknown>) => ({
      id: item.id,
      title: item.title,
      price: parsePrice(item.price as string),
      imageUrl: item.imageUrl,
      category: item.category,
      condition: item.condition,
      status: item.status,
      createdAt: item.createdAt,
      isFavorite: true,
      seller: {
        id: item['seller.id'],
        username: item['seller.username'],
        avatarUrl: item['seller.avatarUrl'],
      },
    }));

    return reply.send({ success: true, data: formattedFavorites });
  });

  /**
   * POST /api/favorites
   * Add a product to favorites (idempotent)
   */
  fastify.post<{ Body: { productId: string } }>('/', async (request, reply) => {
    await request.jwtVerify();
    const { userId } = request.user as { userId: string };
    const { productId } = request.body;

    if (!productId) {
      return reply.status(400).send({ success: false, error: 'productId is required' });
    }

    const product = await db('products').where({ id: productId }).first();
    if (!product) {
      return reply.status(404).send({ success: false, error: 'PRODUCT_NOT_FOUND' });
    }

    await db('favorites')
      .insert({ user_id: userId, product_id: productId })
      .onConflict(['user_id', 'product_id'])
      .ignore();

    return reply.send({ success: true, message: 'Added to favorites' });
  });

  /**
   * DELETE /api/favorites/:productId
   * Remove a product from favorites
   */
  fastify.delete<{ Params: { productId: string } }>('/:productId', async (request, reply) => {
    await request.jwtVerify();
    const { userId } = request.user as { userId: string };
    const { productId } = request.params;

    await db('favorites')
      .where({ user_id: userId, product_id: productId })
      .del();

    return reply.status(204).send();
  });
}
