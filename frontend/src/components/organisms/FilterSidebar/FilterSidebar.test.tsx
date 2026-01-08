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
    const closeButton = container.querySelector(String.raw`button.p-2.hover\:bg-gray-100`);
    expect(closeButton).toBeInTheDocument();

    if (closeButton) {
      fireEvent.click(closeButton);
      expect(onClose).toHaveBeenCalled();
    }
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

  it('toggles filter sections when clicked', () => {
    render(
      <FilterSidebar
        filters={defaultFilters}
        categories={mockCategories}
        onFilterChange={vi.fn()}
      />
    );

    const categoriesButton = screen.getByText('Categories').closest('button');
    expect(categoriesButton).toBeInTheDocument();

    // Section should be expanded initially
    expect(screen.getByText('Sneakers')).toBeInTheDocument();

    // Click to collapse
    if (categoriesButton) fireEvent.click(categoriesButton);

    // Section should be collapsed - items not visible
    expect(screen.queryByText('Sneakers')).not.toBeInTheDocument();
  });

  it('shows clear filters button only when filters are active', () => {
    // Test without active filters
    const { unmount } = render(
      <FilterSidebar
        filters={defaultFilters}
        categories={mockCategories}
        onFilterChange={vi.fn()}
      />
    );

    // No active filters - button should not exist
    expect(screen.queryByText('Effacer les filtres')).not.toBeInTheDocument();
    unmount();

    // Test with active filters
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

    // Clear button should appear
    expect(screen.getByText('Effacer les filtres')).toBeInTheDocument();
  });

  it('clears all filters when clear button is clicked', () => {
    const onFilterChange = vi.fn();
    const filtersWithSelection: ProductFilters = {
      categories: ['1'],
      conditions: ['new'],
      minPrice: 10,
      maxPrice: 100,
      sort: 'price_asc',
    };

    render(
      <FilterSidebar
        filters={filtersWithSelection}
        categories={mockCategories}
        onFilterChange={onFilterChange}
      />
    );

    const clearButton = screen.getByText('Effacer les filtres');
    fireEvent.click(clearButton);

    expect(onFilterChange).toHaveBeenCalledWith({ sort: 'recent' });
  });

  it('unchecks category when clicked twice', () => {
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

    // Click to select
    fireEvent.click(checkbox);
    // Click again to unselect
    fireEvent.click(checkbox);

    const applyButton = screen.getByText('Appliquer les filtres');
    fireEvent.click(applyButton);

    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        categories: [],
      })
    );
  });

  it('calls onClose in mobile mode after applying filters', () => {
    const onClose = vi.fn();
    render(
      <FilterSidebar
        filters={defaultFilters}
        categories={mockCategories}
        onFilterChange={vi.fn()}
        onClose={onClose}
        isMobile
      />
    );

    const applyButton = screen.getByText('Appliquer les filtres');
    fireEvent.click(applyButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('handles maxPrice input change', () => {
    const onFilterChange = vi.fn();
    render(
      <FilterSidebar
        filters={defaultFilters}
        categories={mockCategories}
        onFilterChange={onFilterChange}
      />
    );

    const maxPriceInput = screen.getByPlaceholderText('Max');
    fireEvent.change(maxPriceInput, { target: { value: '500' } });

    const applyButton = screen.getByText('Appliquer les filtres');
    fireEvent.click(applyButton);

    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        maxPrice: 500,
      })
    );
  });
});
