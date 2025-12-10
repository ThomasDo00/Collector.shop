import type { Product } from './product.types';

/**
 * Cart item
 */
export interface CartItem {
  id: string;
  product: Product;
  quantity: number; // Usually 1 for collectibles
  addedAt: string;
}

/**
 * Cart totals with commission breakdown
 */
export interface CartTotals {
  subtotal: number;
  platformFee: number; // 5% commission
  shipping: number;
  total: number;
  itemCount: number;
}

/**
 * Add to cart request
 */
export interface AddToCartRequest {
  productId: string;
  quantity?: number;
}

/**
 * Shipping address
 */
export interface ShippingAddress {
  id?: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

/**
 * Order status
 */
export type OrderStatus =
  | 'payment_validated'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'dispute'
  | 'refunded';

/**
 * Order entity
 */
export interface Order {
  id: string;
  items: CartItem[];
  totals: CartTotals;
  shippingAddress: ShippingAddress;
  status: OrderStatus;
  trackingNumber?: string;
  paymentId: string;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
  sellerPaidAt?: string; // J+7 after delivery
}

/**
 * Checkout session request
 */
export interface CheckoutRequest {
  shippingAddressId: string;
  items: { productId: string; quantity: number }[];
}
