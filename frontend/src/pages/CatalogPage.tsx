import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Typography from '@/components/atoms/Typography';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import Breadcrumb from '@/components/molecules/Breadcrumb';
import ProductGrid from '@/components/organisms/ProductGrid';
import FilterSidebar from '@/components/organisms/FilterSidebar';
import { catalogService } from '@/services/catalog.service';
import { logger } from '@/core/logger';
import type { ProductPreview, ProductFilters, Category } from '@/types';

/**
 * Catalog page with product grid and filters
 */
function CatalogPage() {
  const { category: categorySlug } = useParams<{ category?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductPreview[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<ProductFilters>({
    sort: (searchParams.get('sort') as ProductFilters['sort']) || 'recent',
    categories: [],
  });
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Load categories and products from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [fetchedCategories, fetchedProducts] = await Promise.all([
          catalogService.getCategories(),
          catalogService.getProducts(),
        ]);
        setCategories(fetchedCategories);
        setProducts(fetchedProducts);

        // Set initial category filter from URL
        if (categorySlug) {
          const category = fetchedCategories.find(c => c.slug === categorySlug);
          if (category) {
            setFilters(prev => ({
              ...prev,
              categories: [category.id],
            }));
          }
        }
      } catch (error) {
        logger.error('Failed to load catalog data', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [categorySlug]);

  // Get current category from URL
  const currentCategory = useMemo(() => {
    if (!categorySlug) return null;
    return categories.find(c => c.slug === categorySlug) || null;
  }, [categorySlug, categories]);

  // Filter products based on current filters
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by category
    if (filters.categories && filters.categories.length > 0) {
      const categoryNames = new Set(filters.categories.map(id =>
        categories.find(c => c.id === id)?.name
      ).filter(Boolean));
      result = result.filter(p => p.category && categoryNames.has(p.category));
    }

    // Filter by price
    if (filters.minPrice !== undefined) {
      result = result.filter(p => p.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      result = result.filter(p => p.price <= filters.maxPrice!);
    }

    // Filter by condition
    if (filters.conditions && filters.conditions.length > 0) {
      result = result.filter(p => filters.conditions!.includes(p.condition));
    }

    // Search query
    const query = searchParams.get('q');
    if (query) {
      const lowerQuery = query.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(lowerQuery) ||
        p.category?.toLowerCase().includes(lowerQuery)
      );
    }

    // Sort
    switch (filters.sort) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        result.sort((a, b) => (b.seller.rating || 0) - (a.seller.rating || 0));
        break;
      case 'recent':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [filters, searchParams, products, categories]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.sort && filters.sort !== 'recent') {
      params.set('sort', filters.sort);
    }
    const query = searchParams.get('q');
    if (query) {
      params.set('q', query);
    }
    setSearchParams(params, { replace: true });
  }, [filters.sort, setSearchParams, searchParams]);

  const handleFilterChange = (newFilters: ProductFilters) => {
    setFilters(newFilters);
  };

  const handleFavoriteToggle = (productId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Catalogue', href: '/catalog' },
    ...(currentCategory ? [{ label: currentCategory.name }] : []),
  ];

  const searchQuery = searchParams.get('q');

  const pluralSuffix = filteredProducts.length === 1 ? '' : 's';
  const minPriceLabel = filters.minPrice ? `${filters.minPrice}€` : '0€';
  const maxPriceLabel = filters.maxPrice ? `${filters.maxPrice}€` : '∞';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container-page py-6">
          <Breadcrumb items={breadcrumbItems} />

          <div className="mt-4">
            <Typography variant="h2">
              {(() => {
                if (searchQuery) return `Resultats pour "${searchQuery}"`;
                if (currentCategory) return currentCategory.name;
                return 'Tous les articles';
              })()}
            </Typography>
            <p className="text-gray-500 mt-1">
              {filteredProducts.length} article{pluralSuffix} trouve{pluralSuffix}
            </p>
          </div>
        </div>
      </div>

      <div className="container-page py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-lg shadow-sm p-4">
              <FilterSidebar
                filters={filters}
                categories={categories}
                onFilterChange={handleFilterChange}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Mobile Filter Button & Sort */}
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <Button
                variant="outline"
                leftIcon={<Icon name="filter" size="sm" />}
                onClick={() => setIsMobileFilterOpen(true)}
              >
                Filtres
              </Button>

              <select
                value={filters.sort || 'recent'}
                onChange={(e) => setFilters({ ...filters, sort: e.target.value as ProductFilters['sort'] })}
                className="input-field py-2 pl-3 pr-8 text-sm w-auto"
              >
                <option value="recent">Plus recents</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix decroissant</option>
                <option value="popular">Plus populaires</option>
              </select>
            </div>

            {/* Active filters tags */}
            {((filters.categories?.length ?? 0) > 0 || filters.minPrice || filters.maxPrice) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {filters.categories?.map(catId => {
                  const cat = categories.find(c => c.id === catId);
                  return cat ? (
                    <span
                      key={catId}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-800 rounded-full text-sm"
                    >
                      {cat.name}
                      <button
                        onClick={() => setFilters({
                          ...filters,
                          categories: filters.categories?.filter(id => id !== catId)
                        })}
                        className="hover:text-primary-900"
                      >
                        <Icon name="close" size="xs" />
                      </button>
                    </span>
                  ) : null;
                })}
                {(filters.minPrice || filters.maxPrice) && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-800 rounded-full text-sm">
                    {minPriceLabel} - {maxPriceLabel}
                    <button
                      onClick={() => setFilters({ ...filters, minPrice: undefined, maxPrice: undefined })}
                      className="hover:text-primary-900"
                    >
                      <Icon name="close" size="xs" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Product Grid */}
            {loading ? (
              <div className="text-center py-12">
                <Typography variant="body" className="text-gray-500">
                  Chargement des produits...
                </Typography>
              </div>
            ) : (
              <ProductGrid
                products={filteredProducts}
                onFavoriteToggle={handleFavoriteToggle}
                favorites={favorites}
                emptyMessage={
                  searchQuery
                    ? `Aucun resultat pour "${searchQuery}"`
                    : 'Aucun article dans cette categorie'
                }
              />
            )}

            {/* Load More */}
            {filteredProducts.length >= 12 && (
              <div className="text-center mt-12">
                <Button variant="outline" size="lg">
                  Charger plus d'articles
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <>
          {/* Overlay */}
          <button
            className="fixed inset-0 bg-black/50 z-40 lg:hidden cursor-default"
            onClick={() => setIsMobileFilterOpen(false)}
            aria-label="Fermer les filtres"
          />

          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 w-80 max-w-full bg-white z-50 lg:hidden overflow-y-auto animate-slide-up">
            <FilterSidebar
              filters={filters}
              categories={categories}
              onFilterChange={handleFilterChange}
              onClose={() => setIsMobileFilterOpen(false)}
              isMobile
            />
          </div>
        </>
      )}
    </div>
  );
}

export default CatalogPage;
