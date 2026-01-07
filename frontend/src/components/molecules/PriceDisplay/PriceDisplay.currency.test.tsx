import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PriceDisplay from './PriceDisplay';

describe('PriceDisplay currency', () => {
  it('shows currency symbol for EUR', () => {
    render(<PriceDisplay price={10} currency="EUR" /> as any);
    expect(screen.getByText(/€/)).toBeTruthy();
  });
});
