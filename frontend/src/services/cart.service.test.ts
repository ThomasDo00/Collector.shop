import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cartService } from './cart.service';
import { apiClient } from './api/client';

vi.mock('./api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('cartService', () => {
  const userId = 'user-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCart', () => {
    it('should fetch cart successfully', async () => {
      const mockCart = {
        items: [{ id: '1', productId: 'p1', quantity: 2 }],
        subtotal: 100,
        commission: 5,
        shipping: 8.9,
        total: 113.9,
      };

      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: mockCart },
      });

      const result = await cartService.getCart(userId);

      expect(apiClient.get).toHaveBeenCalledWith(`/cart/${userId}`);
      expect(result).toEqual(mockCart);
    });

    it('should handle empty cart', async () => {
      const emptyCart = {
        items: [],
        subtotal: 0,
        commission: 0,
        shipping: 0,
        total: 0,
      };

      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: emptyCart },
      });

      const result = await cartService.getCart(userId);

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('addItem', () => {
    it('should add item to cart successfully', async () => {
      const productId = 'product-456';
      const quantity = 3;

      vi.mocked(apiClient.post).mockResolvedValue({ data: { success: true } });

      await cartService.addItem(userId, productId, quantity);

      expect(apiClient.post).toHaveBeenCalledWith(`/cart/${userId}/items`, {
        productId,
        quantity,
      });
    });

    it('should use default quantity of 1', async () => {
      const productId = 'product-456';

      vi.mocked(apiClient.post).mockResolvedValue({ data: { success: true } });

      await cartService.addItem(userId, productId);

      expect(apiClient.post).toHaveBeenCalledWith(`/cart/${userId}/items`, {
        productId,
        quantity: 1,
      });
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart successfully', async () => {
      const itemId = 'item-789';

      vi.mocked(apiClient.delete).mockResolvedValue({
        data: { success: true },
      });

      await cartService.removeItem(userId, itemId);

      expect(apiClient.delete).toHaveBeenCalledWith(
        `/cart/${userId}/items/${itemId}`
      );
    });
  });

  describe('clearCart', () => {
    it('should clear cart successfully', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({
        data: { success: true },
      });

      await cartService.clearCart(userId);

      expect(apiClient.delete).toHaveBeenCalledWith(`/cart/${userId}`);
    });
  });
});
