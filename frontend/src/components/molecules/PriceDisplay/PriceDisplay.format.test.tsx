import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PriceDisplay from './PriceDisplay';

describe('PriceDisplay format', () => {
  it('renders formatted price', () => {
    render(<PriceDisplay price={99.5} />);
    expect(screen.getByText(/99/)).toBeInTheDocument();
  });
});
