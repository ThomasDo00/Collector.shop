import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProductGrid from './ProductGrid';
import type { ProductPreview } from '@/types';

const mockProducts: ProductPreview[] = [
  {
    id: '1',
    title: 'Product 1',
    price: 100,
    imageUrl: 'https://example.com/1.jpg',
    category: 'Category 1',
    condition: 'new',
    status: 'active',
    seller: { id: 's1', username: 'seller1', rating: 4.5 },
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    title: 'Product 2',
    price: 200,
    imageUrl: 'https://example.com/2.jpg',
    category: 'Category 2',
    condition: 'like_new',
    status: 'active',
    seller: { id: 's2', username: 'seller2', rating: 4.8 },
    createdAt: '2024-01-02',
  },
];

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('ProductGrid', () => {
  it('renders all products', () => {
    renderWithRouter(<ProductGrid products={mockProducts} />);

    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
  });

  it('renders empty message when no products', () => {
    renderWithRouter(<ProductGrid products={[]} />);

    expect(screen.getByText('Aucun produit trouve')).toBeInTheDocument();
  });

  it('renders custom empty message', () => {
    renderWithRouter(
      <ProductGrid products={[]} emptyMessage="Custom empty message" />
    );

    expect(screen.getByText('Custom empty message')).toBeInTheDocument();
  });

  it('applies correct grid columns class', () => {
    const { container } = renderWithRouter(
      <ProductGrid products={mockProducts} columns={3} />
    );

    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('lg:grid-cols-3');
  });

  it('applies 4 column layout', () => {
    const { container } = renderWithRouter(
      <ProductGrid products={mockProducts} columns={4} />
    );

    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('xl:grid-cols-4');
  });

  it('renders loading state', () => {
    renderWithRouter(<ProductGrid products={mockProducts} isLoading={true} />);

    expect(screen.getByText('Chargement...')).toBeInTheDocument();
  });
});
