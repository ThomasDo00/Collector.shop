import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PriceDisplay from './PriceDisplay';

describe('PriceDisplay - Coverage Tests', () => {
  it('renders price with commission breakdown when showCommission is true', () => {
    render(<PriceDisplay price={100} showCommission={true} />);

    expect(screen.getByText(/Frais de service/i)).toBeInTheDocument();
    expect(screen.getByText(/Total/i)).toBeInTheDocument();
  });

  it('does not render commission when showCommission is false', () => {
    render(<PriceDisplay price={100} showCommission={false} />);

    expect(screen.queryByText(/Frais de service/i)).not.toBeInTheDocument();
  });

  it('renders discount badge when originalPrice is higher than price', () => {
    render(<PriceDisplay price={80} originalPrice={100} />);

    expect(screen.getByText(/-20%/i)).toBeInTheDocument();
  });

  it('does not render discount when originalPrice equals price', () => {
    render(<PriceDisplay price={100} originalPrice={100} />);

    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it('does not render discount when originalPrice is less than price', () => {
    render(<PriceDisplay price={100} originalPrice={80} />);

    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it('renders with all size variants', () => {
    const sizes = ['sm', 'md', 'lg', 'xl'] as const;

    sizes.forEach(size => {
      const { unmount } = render(<PriceDisplay price={100} size={size} />);
      expect(screen.getByText(/100/)).toBeInTheDocument();
      unmount();
    });
  });

  it('renders with custom currency', () => {
    render(<PriceDisplay price={100} currency="USD" />);
    expect(screen.getByText(/100/)).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const { container } = render(<PriceDisplay price={100} className="custom-class" />);
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('calculates commission correctly', () => {
    render(<PriceDisplay price={100} showCommission={true} />);

    // 5% of 100 = 5 - need to match the exact format with "+"
    expect(screen.getByText(/\+ 5,00/)).toBeInTheDocument();
    // Total = 105
    expect(screen.getByText(/105,00/)).toBeInTheDocument();
  });

  it('renders discount with originalPrice and showCommission together', () => {
    render(<PriceDisplay price={80} originalPrice={100} showCommission={true} />);

    expect(screen.getByText(/-20%/i)).toBeInTheDocument();
    expect(screen.getByText(/Frais de service/i)).toBeInTheDocument();
  });

  it('renders price without originalPrice and commission', () => {
    render(<PriceDisplay price={50} />);

    expect(screen.getByText(/50,00/)).toBeInTheDocument();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Frais de service/i)).not.toBeInTheDocument();
  });
});
