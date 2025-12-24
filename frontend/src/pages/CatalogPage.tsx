import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Typography from '@/components/atoms/Typography';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import Breadcrumb from '@/components/molecules/Breadcrumb';
import ProductGrid from '@/components/organisms/ProductGrid';
import FilterSidebar from '@/components/organisms/FilterSidebar';
import type { ProductPreview, ProductFilters, Category } from '@/types';

// Placeholder categories until backend is ready
const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'Sneakers', slug: 'sneakers', productCount: 234 },
  { id: '2', name: 'Figurines', slug: 'figurines', productCount: 156 },
  { id: '3', name: 'Vinyles', slug: 'vinyl', productCount: 89 },
  { id: '4', name: 'Posters', slug: 'posters', productCount: 167 },
  { id: '5', name: 'Cartes', slug: 'cards', productCount: 312 },
  { id: '6', name: 'Montres', slug: 'watches', productCount: 45 },
];

// Placeholder products until backend is ready
const MOCK_PRODUCTS: ProductPreview[] = [
  { id: '1', title: 'Nike Air Max 1 "Patta"', price: 450, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', category: 'Sneakers', condition: 'new', status: 'active', seller: { id: '1', username: 'sneakerhead42', rating: 4.9 }, createdAt: '2024-01-15' },
  { id: '2', title: 'Figurine Dragon Ball Z Goku Ultra Instinct', price: 180, imageUrl: 'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=400', category: 'Figurines', condition: 'new', status: 'active', seller: { id: '2', username: 'collector_pro', rating: 4.8 }, createdAt: '2024-01-14' },
  { id: '3', title: 'Vinyle Pink Floyd - The Wall Edition Limitee', price: 75, imageUrl: 'https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?w=400', category: 'Vinyles', condition: 'like_new', status: 'active', seller: { id: '3', username: 'vinyl_addict', rating: 5.0 }, createdAt: '2024-01-13' },
  { id: '4', title: 'Poster Star Wars Original 1977', price: 220, imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400', category: 'Posters', condition: 'good', status: 'active', seller: { id: '4', username: 'movie_buff', rating: 4.7 }, createdAt: '2024-01-12' },
  { id: '5', title: 'Nike Dunk Low "Panda"', price: 180, imageUrl: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400', category: 'Sneakers', condition: 'new', status: 'active', seller: { id: '5', username: 'kicks_dealer', rating: 4.6 }, createdAt: '2024-01-11' },
  { id: '6', title: 'Carte Pokemon Dracaufeu Holographique 1ere Edition', price: 1500, imageUrl: 'https://images.unsplash.com/photo-1606503153255-59d7e10e6b5e?w=400', category: 'Cartes', condition: 'very_good', status: 'active', seller: { id: '6', username: 'pokemon_master', rating: 4.9 }, createdAt: '2024-01-10' },
  { id: '7', title: 'Montre Casio G-Shock x A Bathing Ape', price: 350, imageUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400', category: 'Montres', condition: 'new', status: 'active', seller: { id: '7', username: 'watch_collector', rating: 4.8 }, createdAt: '2024-01-09' },
  { id: '8', title: 'Figurine One Piece Luffy Gear 5', price: 250, imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', category: 'Figurines', condition: 'new', status: 'active', seller: { id: '8', username: 'anime_fan', rating: 4.7 }, createdAt: '2024-01-08' },
  { id: '9', title: 'Vinyle Daft Punk - Random Access Memories', price: 55, imageUrl: 'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?w=400', category: 'Vinyles', condition: 'like_new', status: 'reserved', seller: { id: '9', username: 'electro_lover', rating: 4.5 }, createdAt: '2024-01-07' },
  { id: '10', title: 'Poster Pulp Fiction Original Cinema', price: 180, imageUrl: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400', category: 'Posters', condition: 'good', status: 'active', seller: { id: '10', username: 'cinema_lover', rating: 4.6 }, createdAt: '2024-01-06' },
  { id: '11', title: 'Nike Air Jordan 1 "Chicago" 2015', price: 850, imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=400', category: 'Sneakers', condition: 'very_good', status: 'sold', seller: { id: '11', username: 'jordan_king', rating: 4.9 }, createdAt: '2024-01-05' },
  { id: '12', title: 'Carte Yu-Gi-Oh Dragon Blanc aux Yeux Bleus', price: 380, imageUrl: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=400', category: 'Cartes', condition: 'like_new', status: 'active', seller: { id: '12', username: 'duelist', rating: 4.4 }, createdAt: '2024-01-04' },
];

/**
 * Catalog page with product grid and filters
 */
function CatalogPage() {
  const { category: categorySlug } = useParams<{ category?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState<ProductFilters>({
    sort: (searchParams.get('sort') as ProductFilters['sort']) || 'recent',
    categories: categorySlug
      ? [MOCK_CATEGORIES.find(c => c.slug === categorySlug)?.id || '']
      : [],
  });
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Get current category from URL
  const currentCategory = useMemo(() => {
    if (!categorySlug) return null;
    return MOCK_CATEGORIES.find(c => c.slug === categorySlug) || null;
  }, [categorySlug]);

  // Filter products based on current filters
  const filteredProducts = useMemo(() => {
    let result = [...MOCK_PRODUCTS];

    // Filter by category
    if (filters.categories && filters.categories.length > 0) {
      const categoryNames = filters.categories.map(id =>
        MOCK_CATEGORIES.find(c => c.id === id)?.name
      ).filter(Boolean);
      result = result.filter(p => categoryNames.includes(p.category));
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
  }, [filters, searchParams]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container-page py-6">
          <Breadcrumb items={breadcrumbItems} />

          <div className="mt-4">
            <Typography variant="h2">
              {searchQuery
                ? `Resultats pour "${searchQuery}"`
                : currentCategory
                  ? currentCategory.name
                  : 'Tous les articles'}
            </Typography>
            <p className="text-gray-500 mt-1">
              {filteredProducts.length} article{filteredProducts.length !== 1 ? 's' : ''} trouve{filteredProducts.length !== 1 ? 's' : ''}
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
                categories={MOCK_CATEGORIES}
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
                  const cat = MOCK_CATEGORIES.find(c => c.id === catId);
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
                    {filters.minPrice ? `${filters.minPrice}€` : '0€'} - {filters.maxPrice ? `${filters.maxPrice}€` : '∞'}
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
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileFilterOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 w-80 max-w-full bg-white z-50 lg:hidden overflow-y-auto animate-slide-up">
            <FilterSidebar
              filters={filters}
              categories={MOCK_CATEGORIES}
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
