import { apiClient } from './api/client';

export interface CartItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  imageUrl: string;
  seller: {
    username: string;
  };
  quantity?: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  commission: number;
  shipping: number;
  total: number;
}

export const cartService = {
  /**
   * Get user's cart
   */
  async getCart(userId: string): Promise<Cart> {
    const response = await apiClient.get(`/cart/${userId}`);
    return response.data.data;
  },

  /**
   * Add item to cart
   */
  async addItem(userId: string, productId: string, quantity = 1): Promise<void> {
    await apiClient.post(`/cart/${userId}/items`, { productId, quantity });
  },

  /**
   * Remove item from cart
   */
  async removeItem(userId: string, itemId: string): Promise<void> {
    await apiClient.delete(`/cart/${userId}/items/${itemId}`);
  },

  /**
   * Clear entire cart
   */
  async clearCart(userId: string): Promise<void> {
    await apiClient.delete(`/cart/${userId}`);
  },
};
