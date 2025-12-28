import ProductCard from '@/components/organisms/ProductCard';
import Spinner from '@/components/atoms/Spinner';
import type { ProductPreview } from '@/types';

interface ProductGridProps {
  products: ProductPreview[];
  isLoading?: boolean;
  onFavoriteToggle?: (productId: string) => void;
  favorites?: Set<string>;
  emptyMessage?: string;
  columns?: 2 | 3 | 4;
}

/**
 * Grid layout for displaying products
 */
function ProductGrid({
  products,
  isLoading = false,
  onFavoriteToggle,
  favorites = new Set(),
  emptyMessage = 'Aucun produit trouve',
  columns = 4,
}: Readonly<ProductGridProps>) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <p className="text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-6`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onFavoriteToggle={onFavoriteToggle}
          isFavorite={favorites.has(product.id)}
        />
      ))}
    </div>
  );
}

export default ProductGrid;
