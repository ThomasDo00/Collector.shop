import { useState } from 'react';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import type { ProductFilters, Category } from '@/types';

interface FilterSidebarProps {
  filters: ProductFilters;
  categories: Category[];
  onFilterChange: (filters: ProductFilters) => void;
  onClose?: () => void;
  isMobile?: boolean;
}

const CONDITIONS = [
  { value: 'new', label: 'Neuf' },
  { value: 'like_new', label: 'Comme neuf' },
  { value: 'very_good', label: 'Tres bon' },
  { value: 'good', label: 'Bon' },
  { value: 'fair', label: 'Correct' },
];

const SORT_OPTIONS = [
  { value: 'recent', label: 'Plus recents' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix decroissant' },
  { value: 'popular', label: 'Plus populaires' },
];

/**
 * Filter sidebar for catalog page
 */
function FilterSidebar({
  filters,
  categories,
  onFilterChange,
  onClose,
  isMobile = false,
}: FilterSidebarProps) {
  const [localFilters, setLocalFilters] = useState<ProductFilters>(filters);
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    condition: true,
    sort: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCategoryChange = (categoryId: string) => {
    const newCategories = localFilters.categories?.includes(categoryId)
      ? localFilters.categories.filter((c) => c !== categoryId)
      : [...(localFilters.categories || []), categoryId];

    setLocalFilters({ ...localFilters, categories: newCategories });
  };

  const handleConditionChange = (condition: string) => {
    const newConditions = localFilters.conditions?.includes(condition)
      ? localFilters.conditions.filter((c) => c !== condition)
      : [...(localFilters.conditions || []), condition];

    setLocalFilters({ ...localFilters, conditions: newConditions });
  };

  const handlePriceChange = (field: 'minPrice' | 'maxPrice', value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    setLocalFilters({ ...localFilters, [field]: numValue });
  };

  const handleSortChange = (sort: string) => {
    setLocalFilters({ ...localFilters, sort: sort as ProductFilters['sort'] });
  };

  const applyFilters = () => {
    onFilterChange(localFilters);
    if (isMobile) onClose?.();
  };

  const clearFilters = () => {
    const clearedFilters: ProductFilters = { sort: 'recent' };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters =
    (localFilters.categories?.length ?? 0) > 0 ||
    (localFilters.conditions?.length ?? 0) > 0 ||
    localFilters.minPrice !== undefined ||
    localFilters.maxPrice !== undefined;

  return (
    <div className={`${isMobile ? 'p-4' : ''}`}>
      {/* Mobile header */}
      {isMobile && (
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <h2 className="text-lg font-semibold">Filtres</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <Icon name="close" size="md" />
          </button>
        </div>
      )}

      {/* Sort */}
      <FilterSection
        title="Trier par"
        isExpanded={expandedSections.sort}
        onToggle={() => toggleSection('sort')}
      >
        <div className="space-y-2">
          {SORT_OPTIONS.map((option) => (
            <label key={option.value} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="sort"
                value={option.value}
                checked={localFilters.sort === option.value}
                onChange={() => handleSortChange(option.value)}
                className="w-4 h-4 text-primary-800 focus:ring-primary-800"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Categories */}
      <FilterSection
        title="Categories"
        isExpanded={expandedSections.categories}
        onToggle={() => toggleSection('categories')}
      >
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {categories.map((category) => (
            <label key={category.id} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localFilters.categories?.includes(category.id) || false}
                onChange={() => handleCategoryChange(category.id)}
                className="w-4 h-4 text-primary-800 rounded focus:ring-primary-800"
              />
              <span className="text-sm">{category.name}</span>
              <span className="text-xs text-gray-400 ml-auto">({category.productCount})</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection
        title="Prix"
        isExpanded={expandedSections.price}
        onToggle={() => toggleSection('price')}
      >
        <div className="flex items-center gap-3">
          <input
            type="number"
            placeholder="Min"
            value={localFilters.minPrice ?? ''}
            onChange={(e) => handlePriceChange('minPrice', e.target.value)}
            className="input-field py-2 text-sm"
            min="0"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            placeholder="Max"
            value={localFilters.maxPrice ?? ''}
            onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
            className="input-field py-2 text-sm"
            min="0"
          />
        </div>
      </FilterSection>

      {/* Condition */}
      <FilterSection
        title="Etat"
        isExpanded={expandedSections.condition}
        onToggle={() => toggleSection('condition')}
      >
        <div className="space-y-2">
          {CONDITIONS.map((condition) => (
            <label key={condition.value} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localFilters.conditions?.includes(condition.value) || false}
                onChange={() => handleConditionChange(condition.value)}
                className="w-4 h-4 text-primary-800 rounded focus:ring-primary-800"
              />
              <span className="text-sm">{condition.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Action buttons */}
      <div className="mt-6 space-y-3">
        <Button variant="primary" fullWidth onClick={applyFilters}>
          Appliquer les filtres
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" fullWidth onClick={clearFilters}>
            Effacer les filtres
          </Button>
        )}
      </div>
    </div>
  );
}

interface FilterSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function FilterSection({ title, isExpanded, onToggle, children }: FilterSectionProps) {
  return (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="font-medium text-accent">{title}</span>
        <Icon
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size="sm"
          className="text-gray-400"
        />
      </button>
      {isExpanded && <div className="mt-4">{children}</div>}
    </div>
  );
}

export default FilterSidebar;
