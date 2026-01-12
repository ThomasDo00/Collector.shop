import type { FastifyInstance } from 'fastify';
import { getDatabase } from '@core/database/index.js';
import { parsePrice, roundMoney } from '../../utils/transformers.js';

export async function cartRoutes(fastify: FastifyInstance) {
  const db = getDatabase();

  /**
   * GET /api/cart/:userId
   * Get user's cart with calculated totals
   */
  fastify.get<{ Params: { userId: string } }>('/:userId', async (request, _reply) => {
    const { userId } = request.params;

    // Get cart items with product details
    const cartItems = await db('cart_items')
      .select(
        'cart_items.id',
        'cart_items.product_id as productId',
        'cart_items.quantity',
        'products.title',
        'products.price',
        'products.image_url as imageUrl',
        'seller.username as seller.username'
      )
      .leftJoin('products', 'cart_items.product_id', 'products.id')
      .leftJoin('users as seller', 'products.seller_id', 'seller.id')
      .where('cart_items.user_id', userId);

    if (cartItems.length === 0) {
      return {
        success: true,
        data: {
          items: [],
          subtotal: 0,
          commission: 0,
          shipping: 0,
          total: 0,
        },
      };
    }

    // Format items
    const formattedItems = cartItems.map((item: Record<string, unknown>) => ({
      id: item.id,
      productId: item.productId,
      title: item.title,
      price: parsePrice(item.price as string),
      imageUrl: item.imageUrl,
      seller: {
        username: item['seller.username'],
      },
      quantity: Number(item.quantity),
    }));

    // Calculate totals
    const subtotal = formattedItems.reduce((sum, item) => sum + item.price * Number(item.quantity), 0);
    const commission = subtotal * 0.05; // 5% commission
    const shipping = 8.9; // Fixed shipping for now
    const total = subtotal + commission + shipping;

    return {
      success: true,
      data: {
        items: formattedItems,
        subtotal: roundMoney(subtotal),
        commission: roundMoney(commission),
        shipping,
        total: roundMoney(total),
      },
    };
  });

  /**
   * POST /api/cart/:userId/items
   * Add item to cart
   */
  fastify.post<{ Params: { userId: string }; Body: { productId: string; quantity?: number } }>(
    '/:userId/items',
    async (request, reply) => {
      const { userId } = request.params;
      const { productId, quantity = 1 } = request.body;

      try {
        // Check if product exists
        const product = await db('products').where('id', productId).first();
        if (!product) {
          return reply.status(404).send({ error: 'PRODUCT_NOT_FOUND' });
        }

        // Check if item already in cart
        const existingItem = await db('cart_items')
          .where({ user_id: userId, product_id: productId })
          .first();

        if (existingItem) {
          // Update quantity
          await db('cart_items')
            .where({ user_id: userId, product_id: productId })
            .update({ quantity: quantity, updated_at: new Date() });
        } else {
          // Insert new item
          await db('cart_items').insert({
            user_id: userId,
            product_id: productId,
            quantity,
          });
        }

        return { success: true, message: 'Item added to cart' };
      } catch (error) {
        return reply.status(500).send({ error: 'FAILED_TO_ADD_ITEM' });
      }
    }
  );

  /**
   * DELETE /api/cart/:userId/items/:itemId
   * Remove item from cart
   */
  fastify.delete<{ Params: { userId: string; itemId: string } }>(
    '/:userId/items/:itemId',
    async (request, reply) => {
      const { userId, itemId } = request.params;

      const deleted = await db('cart_items')
        .where({ id: itemId, user_id: userId })
        .del();

      if (deleted === 0) {
        return reply.status(404).send({ error: 'ITEM_NOT_FOUND' });
      }

      return { success: true, message: 'Item removed from cart' };
    }
  );

  /**
   * DELETE /api/cart/:userId
   * Clear entire cart
   */
  fastify.delete<{ Params: { userId: string } }>('/:userId', async (request) => {
    const { userId } = request.params;

    await db('cart_items').where('user_id', userId).del();

    return { success: true, message: 'Cart cleared' };
  });
}
