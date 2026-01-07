import { describe, it, expect } from 'vitest';
import { API_ENDPOINTS } from './endpoints';

describe('endpoints paths extra', () => {
  it('cart endpoints functions', () => {
    expect(API_ENDPOINTS.CART.GET).toBe('/cart');
    expect(API_ENDPOINTS.CART.REMOVE('x')).toBe('/cart/items/x');
  });
});
