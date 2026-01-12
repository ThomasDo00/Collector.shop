/**
 * Data transformation utilities to eliminate code duplication in routes
 */

interface SellerData {
  id?: string;
  sellerId?: string;
  username?: string;
  sellerUsername?: string;
  avatarUrl?: string;
  sellerAvatar?: string;
  rating?: number;
}

/**
 * Transform database seller fields into consistent API format
 */
export function transformSeller(data: SellerData) {
  return {
    id: data.id || data.sellerId,
    username: data.username || data.sellerUsername,
    ...(data.avatarUrl && { avatarUrl: data.avatarUrl }),
    ...(data.sellerAvatar && { avatarUrl: data.sellerAvatar }),
    rating: data.rating || 4.8, // TODO: Calculate real rating from reviews table
  };
}

/**
 * Parse price to float (handles both string and number)
 */
export function parsePrice(price: string | number): number {
  return typeof price === 'string' ? parseFloat(price) : price;
}

/**
 * Round monetary value to 2 decimal places
 */
export function roundMoney(value: number): number {
  return parseFloat(value.toFixed(2));
}
