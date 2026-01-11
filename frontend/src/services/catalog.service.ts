import apiClient from './api/client';
import type { ProductPreview, Category } from '@/types';

/**
 * Catalog service - Products and Categories API
 */
export const catalogService = {
  /**
   * Get all categories
   */
  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get('/catalog/categories');
    return response.data.data;
  },

  /**
   * Get all products with optional filters
   */
  async getProducts(filters?: {
    category?: string;
    status?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
    sort?: string;
    search?: string;
  }): Promise<ProductPreview[]> {
    const response = await apiClient.get('/catalog/products', { params: filters });
    return response.data.data;
  },

  /**
   * Get single product by ID
   */
  async getProduct(id: string): Promise<ProductPreview> {
    const response = await apiClient.get(`/catalog/products/${id}`);
    return response.data.data;
  },
};
