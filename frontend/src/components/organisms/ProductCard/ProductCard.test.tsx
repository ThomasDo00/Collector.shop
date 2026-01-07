import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProductCard from './ProductCard';
import type { ProductPreview } from '@/types';

const mockProduct: ProductPreview = {
  id: '1',
  title: 'Test Product',
  price: 100,
  imageUrl: 'https://example.com/image.jpg',
  category: 'Test Category',
  condition: 'new',
  status: 'active',
  seller: {
    id: 'seller1',
    username: 'testuser',
    rating: 4.5,
  },
  createdAt: '2024-01-01',
};

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('ProductCard', () => {
  it('renders product information', () => {
    renderWithRouter(<ProductCard product={mockProduct} />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('100,00 €')).toBeInTheDocument();
    expect(screen.getByText('Test Category')).toBeInTheDocument();
  });

  it('renders product image with correct alt text', () => {
    renderWithRouter(<ProductCard product={mockProduct} />);

    const image = screen.getByAltText('Test Product');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('renders condition badge', () => {
    renderWithRouter(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Neuf')).toBeInTheDocument();
  });

  it('calls onFavoriteToggle when favorite button is clicked', () => {
    const onFavoriteToggle = vi.fn();
    renderWithRouter(
      <ProductCard
        product={mockProduct}
        isFavorite={false}
        onFavoriteToggle={onFavoriteToggle}
      />
    );

    const favoriteButton = screen.getByLabelText('Ajouter aux favoris');
    fireEvent.click(favoriteButton);

    expect(onFavoriteToggle).toHaveBeenCalledWith('1');
  });

  it('shows filled heart icon when product is favorite', () => {
    renderWithRouter(
      <ProductCard product={mockProduct} isFavorite={true} />
    );

    const favoriteButton = screen.getByLabelText('Retirer des favoris');
    expect(favoriteButton).toBeInTheDocument();
  });

  it('renders seller rating', () => {
    renderWithRouter(<ProductCard product={mockProduct} />);
    expect(screen.getByText('@testuser')).toBeInTheDocument();
  });

  it('links to product detail page', () => {
    renderWithRouter(<ProductCard product={mockProduct} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/product/1');
  });

  it('does not render condition badge for non-new items', () => {
    renderWithRouter(
      <ProductCard product={{ ...mockProduct, condition: 'like_new' }} />
    );
    expect(screen.queryByText('Comme neuf')).not.toBeInTheDocument();
  });

  it('renders sold badge when status is sold', () => {
    renderWithRouter(
      <ProductCard product={{ ...mockProduct, status: 'sold' }} />
    );
    expect(screen.getByText('Vendu')).toBeInTheDocument();
  });
});
