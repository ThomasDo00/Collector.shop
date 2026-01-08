import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Rating from './Rating';

describe('Rating - Coverage Tests', () => {
  it('renders with reviewCount when showCount is true', () => {
    render(<Rating value={4.5} reviewCount={42} showCount={true} />);

    expect(screen.getByText(/42 avis/i)).toBeInTheDocument();
  });

  it('does not render reviewCount when showCount is false', () => {
    render(<Rating value={4.5} reviewCount={42} showCount={false} />);

    expect(screen.queryByText(/avis/i)).not.toBeInTheDocument();
  });

  it('does not render reviewCount when reviewCount is undefined', () => {
    render(<Rating value={4.5} showCount={true} />);

    expect(screen.queryByText(/avis/i)).not.toBeInTheDocument();
  });

  it('renders trusted seller badge when isTrustedSeller is true', () => {
    render(<Rating value={4.8} isTrustedSeller={true} />);

    expect(screen.getByText(/Vendeur de confiance/i)).toBeInTheDocument();
  });

  it('does not render trusted seller badge when isTrustedSeller is false', () => {
    render(<Rating value={4.8} isTrustedSeller={false} />);

    expect(screen.queryByText(/Vendeur de confiance/i)).not.toBeInTheDocument();
  });

  it('renders with all size variants', () => {
    const sizes = ['sm', 'md', 'lg'] as const;

    sizes.forEach(size => {
      const { unmount } = render(<Rating value={4.5} size={size} />);
      expect(screen.getByText(/4[.,]5/)).toBeInTheDocument();
      unmount();
    });
  });

  it('renders with custom maxValue', () => {
    render(<Rating value={8} maxValue={10} />);

    expect(screen.getByLabelText(/Note: 8 sur 10/i)).toBeInTheDocument();
  });

  it('renders half stars correctly', () => {
    render(<Rating value={3.5} />);

    // Should have 3 full stars + 1 half star + 1 empty star
    expect(screen.getByLabelText(/Note: 3\.5 sur 5/i)).toBeInTheDocument();
  });

  it('renders only full stars when value is integer', () => {
    render(<Rating value={4} />);

    expect(screen.getByLabelText(/Note: 4 sur 5/i)).toBeInTheDocument();
  });

  it('rounds value to nearest 0.5', () => {
    render(<Rating value={4.3} />);

    // 4.3 rounds to 4.5
    expect(screen.getByLabelText(/Note: 4\.3 sur 5/i)).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const { container } = render(<Rating value={4.5} className="custom-rating" />);
    expect(container.querySelector('.custom-rating')).toBeInTheDocument();
  });

  it('renders with readonly prop', () => {
    render(<Rating value={4.5} readonly={true} />);

    expect(screen.getByLabelText(/Note: 4\.5 sur 5/i)).toBeInTheDocument();
  });

  it('renders with all features combined', () => {
    render(
      <Rating
        value={4.8}
        maxValue={5}
        reviewCount={156}
        showCount={true}
        size="lg"
        isTrustedSeller={true}
        readonly={true}
        className="custom-class"
      />
    );

    expect(screen.getByText(/4[.,]8/)).toBeInTheDocument();
    expect(screen.getByText(/156 avis/i)).toBeInTheDocument();
    expect(screen.getByText(/Vendeur de confiance/i)).toBeInTheDocument();
  });

  it('renders zero stars correctly', () => {
    render(<Rating value={0} />);

    expect(screen.getByLabelText(/Note: 0 sur 5/i)).toBeInTheDocument();
  });

  it('renders maximum stars correctly', () => {
    render(<Rating value={5} />);

    expect(screen.getByLabelText(/Note: 5 sur 5/i)).toBeInTheDocument();
  });
});
