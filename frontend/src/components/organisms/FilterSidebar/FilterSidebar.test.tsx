import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FilterSidebar from './FilterSidebar';
import type { ProductFilters } from '@/types';

const mockCategories = [
  { id: '1', name: 'Sneakers', slug: 'sneakers', productCount: 10 },
  { id: '2', name: 'Figurines', slug: 'figurines', productCount: 5 },
];

const defaultFilters: ProductFilters = {
  categories: [],
  minPrice: undefined,
  maxPrice: undefined,
  conditions: [],
  sort: 'recent',
};

describe('FilterSidebar', () => {
  it('renders all filter sections', () => {
    render(
      <FilterSidebar
        filters={defaultFilters}
        categories={mockCategories}
        onFilterChange={vi.fn()}
      />
    );

    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Prix')).toBeInTheDocument();
    expect(screen.getByText('Etat')).toBeInTheDocument();
    expect(screen.getByText('Trier par')).toBeInTheDocument();
  });

  it('displays all categories', () => {
    render(
      <FilterSidebar
        filters={defaultFilters}
        categories={mockCategories}
        onFilterChange={vi.fn()}
      />
    );

    expect(screen.getByText('Sneakers')).toBeInTheDocument();
    expect(screen.getByText('Figurines')).toBeInTheDocument();
  });

  it('calls onFilterChange when category is selected and applied', () => {
    const onFilterChange = vi.fn();
    render(
      <FilterSidebar
        filters={defaultFilters}
        categories={mockCategories}
        onFilterChange={onFilterChange}
      />
    );

    const sneakersLabel = screen.getByText('Sneakers');
    const checkbox = sneakersLabel.previousElementSibling as HTMLInputElement;
    fireEvent.click(checkbox);

    const applyButton = screen.getByText('Appliquer les filtres');
    fireEvent.click(applyButton);

    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        categories: ['1'],
      })
    );
  });

  it('calls onFilterChange when price is changed and applied', () => {
    const onFilterChange = vi.fn();
    render(
      <FilterSidebar
        filters={defaultFilters}
        categories={mockCategories}
        onFilterChange={onFilterChange}
      />
    );

    const minPriceInput = screen.getByPlaceholderText('Min');
    fireEvent.change(minPriceInput, { target: { value: '100' } });

    const applyButton = screen.getByText('Appliquer les filtres');
    fireEvent.click(applyButton);

    expect(onFilterChange).toHaveBeenCalled();
  });

  it('calls onFilterChange when sort option is changed and applied', () => {
    const onFilterChange = vi.fn();
    render(
      <FilterSidebar
        filters={defaultFilters}
        categories={mockCategories}
        onFilterChange={onFilterChange}
      />
    );

    const sortLabel = screen.getByText('Prix croissant');
    const sortRadio = sortLabel.previousElementSibling as HTMLInputElement;
    fireEvent.click(sortRadio);

    const applyButton = screen.getByText('Appliquer les filtres');
    fireEvent.click(applyButton);

    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        sort: 'price_asc',
      })
    );
  });

  it('renders close button in mobile mode', () => {
    const onClose = vi.fn();
    const { container } = render(
      <FilterSidebar
        filters={defaultFilters}
        categories={mockCategories}
        onFilterChange={vi.fn()}
        onClose={onClose}
        isMobile
      />
    );

    expect(screen.getByText('Filtres')).toBeInTheDocument();
    const closeButton = container.querySelector('button.p-2.hover\\:bg-gray-100');
    expect(closeButton).toBeInTheDocument();

    fireEvent.click(closeButton!);
    expect(onClose).toHaveBeenCalled();
  });

  it('does not render close button in desktop mode', () => {
    render(
      <FilterSidebar
        filters={defaultFilters}
        categories={mockCategories}
        onFilterChange={vi.fn()}
      />
    );

    expect(screen.queryByText('Filtres')).not.toBeInTheDocument();
  });

  it('displays selected categories', () => {
    const filtersWithSelection: ProductFilters = {
      ...defaultFilters,
      categories: ['1'],
    };

    render(
      <FilterSidebar
        filters={filtersWithSelection}
        categories={mockCategories}
        onFilterChange={vi.fn()}
      />
    );

    const sneakersLabel = screen.getByText('Sneakers');
    const checkbox = sneakersLabel.previousElementSibling as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it('renders all condition options', () => {
    render(
      <FilterSidebar
        filters={defaultFilters}
        categories={mockCategories}
        onFilterChange={vi.fn()}
      />
    );

    expect(screen.getByText('Neuf')).toBeInTheDocument();
    expect(screen.getByText('Comme neuf')).toBeInTheDocument();
    expect(screen.getByText('Tres bon')).toBeInTheDocument();
    expect(screen.getByText('Bon')).toBeInTheDocument();
    expect(screen.getByText('Correct')).toBeInTheDocument();
  });
});
