import { describe, it, expect } from 'vitest';
import PriceDisplay from './PriceDisplay';

describe('PriceDisplay', () => {
  it('formats number without throwing', () => {
    expect(() => PriceDisplay({ price: 1234 })).not.toThrow();
  });
});
