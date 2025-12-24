import type { UserPreview } from './user.types';

/**
 * Product condition
 */
export type ProductCondition = 'new' | 'like_new' | 'very_good' | 'good' | 'fair';

/**
 * Product status
 */
export type ProductStatus = 'pending' | 'active' | 'sold' | 'reserved' | 'expired' | 'rejected';

/**
 * Category entity
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  itemCount?: number;
  productCount?: number;
  subcategories?: Category[];
}

/**
 * Product entity
 */
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: Category;
  condition: ProductCondition;
  seller: UserPreview;
  status: ProductStatus;
  viewCount?: number;
  favoriteCount?: number;
  createdAt: string;
  updatedAt: string;
  expiresAt: string; // 90 days rule
}

/**
 * Product preview for cards
 */
export interface ProductPreview {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  condition: ProductCondition;
  status: ProductStatus;
  seller: UserPreview;
  category?: string;
  categorySlug?: string;
  isFavorite?: boolean;
  createdAt: string;
}

/**
 * Product filters
 */
export interface ProductFilters {
  query?: string;
  category?: string;
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  conditions?: string[];
  sort?: ProductSortOption;
  sortBy?: ProductSortOption;
  sellerId?: string;
}

/**
 * Product sort options
 */
export type ProductSortOption = 'recent' | 'price_asc' | 'price_desc' | 'popular';

/**
 * Create product request
 */
export interface CreateProductRequest {
  title: string;
  description: string;
  price: number;
  categoryId: string;
  condition: ProductCondition;
  images: string[]; // URLs after upload
}

/**
 * Update product request
 */
export interface UpdateProductRequest {
  title?: string;
  description?: string;
  price?: number;
  categoryId?: string;
  condition?: ProductCondition;
  images?: string[];
}

/**
 * Price history entry (for fraud detection display)
 */
export interface PriceHistoryEntry {
  price: number;
  date: string;
}
