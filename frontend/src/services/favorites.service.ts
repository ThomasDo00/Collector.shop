import apiClient from './api/client';
import type { ProductPreview } from '@/types';

/**
 * Favorites service - Manage user's favorite products
 */
export const favoritesService = {
  /**
   * Get all favorites for the authenticated user
   */
  async getFavorites(): Promise<ProductPreview[]> {
    const response = await apiClient.get('/favorites');
    return response.data.data;
  },

  /**
   * Add a product to favorites (idempotent)
   */
  async addFavorite(productId: string): Promise<void> {
    await apiClient.post('/favorites', { productId });
  },

  /**
   * Remove a product from favorites
   */
  async removeFavorite(productId: string): Promise<void> {
    await apiClient.delete(`/favorites/${productId}`);
  },
};
