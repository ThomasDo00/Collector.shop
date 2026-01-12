import { describe, it, expect } from 'vitest';
import { transformSeller, parsePrice, roundMoney } from '../../../src/utils/transformers';

describe('transformers', () => {
  describe('transformSeller', () => {
    it('should transform seller with sellerId and sellerUsername', () => {
      const result = transformSeller({
        sellerId: '123',
        sellerUsername: 'john',
        sellerAvatar: 'avatar.jpg',
      });

      expect(result).toEqual({
        id: '123',
        username: 'john',
        avatarUrl: 'avatar.jpg',
        rating: 4.8,
      });
    });

    it('should transform seller with id and username', () => {
      const result = transformSeller({
        id: '456',
        username: 'jane',
        avatarUrl: 'jane.jpg',
      });

      expect(result).toEqual({
        id: '456',
        username: 'jane',
        avatarUrl: 'jane.jpg',
        rating: 4.8,
      });
    });

    it('should use custom rating when provided', () => {
      const result = transformSeller({
        sellerId: '123',
        sellerUsername: 'john',
        rating: 5.0,
      });

      expect(result.rating).toBe(5.0);
    });

    it('should omit avatarUrl when not provided', () => {
      const result = transformSeller({
        sellerId: '123',
        sellerUsername: 'john',
      });

      expect(result).not.toHaveProperty('avatarUrl');
    });
  });

  describe('parsePrice', () => {
    it('should parse string prices', () => {
      expect(parsePrice('99.99')).toBe(99.99);
      expect(parsePrice('1234.56')).toBe(1234.56);
    });

    it('should handle number prices', () => {
      expect(parsePrice(99.99)).toBe(99.99);
      expect(parsePrice(1234.56)).toBe(1234.56);
    });

    it('should handle edge cases', () => {
      expect(parsePrice('0')).toBe(0);
      expect(parsePrice(0)).toBe(0);
    });
  });

  describe('roundMoney', () => {
    it('should round to 2 decimal places', () => {
      expect(roundMoney(99.999)).toBe(100.00);
      expect(roundMoney(1.234)).toBe(1.23);
      expect(roundMoney(1.235)).toBe(1.24);
    });

    it('should handle already rounded values', () => {
      expect(roundMoney(99.99)).toBe(99.99);
      expect(roundMoney(100.00)).toBe(100.00);
    });

    it('should handle integers', () => {
      expect(roundMoney(100)).toBe(100.00);
      expect(roundMoney(0)).toBe(0.00);
    });
  });
});
