import { describe, it, expect } from 'vitest';
import { formatPrice, formatDateLong, formatDateMonthYear } from './format';

describe('format utilities', () => {
  describe('formatPrice', () => {
    it('should format price in French Euros', () => {
      const result = formatPrice(100);
      expect(result).toContain('100');
      expect(result).toContain('€');

      expect(formatPrice(1234.56)).toMatch(/1\s234,56\s€/);
      expect(formatPrice(0)).toMatch(/0,00\s€/);
    });

    it('should handle decimal values correctly', () => {
      expect(formatPrice(99.99)).toMatch(/99,99\s€/);
      expect(formatPrice(1.5)).toMatch(/1,50\s€/);
    });
  });

  describe('formatDateLong', () => {
    it('should format date in French long format', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDateLong(date);
      expect(formatted).toMatch(/15 janvier 2024/);
    });

    it('should handle string dates', () => {
      const formatted = formatDateLong('2024-12-25');
      expect(formatted).toMatch(/25 décembre 2024/);
    });
  });

  describe('formatDateMonthYear', () => {
    it('should format date in month-year format', () => {
      const date = new Date('2024-03-15');
      const formatted = formatDateMonthYear(date);
      expect(formatted).toMatch(/mars 2024/);
    });

    it('should handle string dates', () => {
      const formatted = formatDateMonthYear('2023-06-01');
      expect(formatted).toMatch(/juin 2023/);
    });
  });
});
