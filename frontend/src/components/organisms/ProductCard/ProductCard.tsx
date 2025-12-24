import { Link } from 'react-router-dom';
import { useState } from 'react';
import Icon from '@/components/atoms/Icon';
import Badge from '@/components/atoms/Badge';
import type { ProductPreview } from '@/types';

interface ProductCardProps {
  product: ProductPreview;
  onFavoriteToggle?: (productId: string) => void;
  isFavorite?: boolean;
}

/**
 * Product card component for displaying products in grids
 */
function ProductCard({ product, onFavoriteToggle, isFavorite = false }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavoriteToggle?.(product.id);
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="card card-interactive group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="aspect-square relative overflow-hidden bg-gray-100">
        <img
          src={product.imageUrl || '/placeholder-product.jpg'}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Status badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.status === 'sold' && (
            <Badge variant="error">Vendu</Badge>
          )}
          {product.status === 'reserved' && (
            <Badge variant="warning">Reserve</Badge>
          )}
          {product.condition === 'new' && (
            <Badge variant="success">Neuf</Badge>
          )}
        </div>

        {/* Favorite button */}
        <button
          onClick={handleFavoriteClick}
          className={`
            absolute top-3 right-3 p-2 rounded-full
            transition-all duration-200
            ${isHovered || isFavorite ? 'opacity-100' : 'opacity-0'}
            ${isFavorite ? 'bg-error-50 text-error-500' : 'bg-white/90 text-gray-600 hover:bg-white hover:text-error-500'}
          `}
          aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Icon name={isFavorite ? 'heart-solid' : 'heart'} size="sm" />
        </button>

        {/* Quick view overlay */}
        <div
          className={`
            absolute inset-0 bg-black/40 flex items-center justify-center
            transition-opacity duration-200
            ${isHovered ? 'opacity-100' : 'opacity-0'}
          `}
        >
          <span className="bg-white text-accent px-4 py-2 rounded-md font-medium text-sm">
            Voir le produit
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        {product.category && (
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            {product.category}
          </p>
        )}

        {/* Title */}
        <h3 className="font-medium text-accent line-clamp-2 mb-1 group-hover:text-primary-800 transition-colors">
          {product.title}
        </h3>

        {/* Seller */}
        <p className="text-sm text-gray-500 mb-2">
          @{product.seller.username}
        </p>

        {/* Price and Rating */}
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg text-accent">
            {product.price.toLocaleString('fr-FR', {
              style: 'currency',
              currency: 'EUR',
            })}
          </span>
          {product.seller.rating && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Icon name="star-solid" size="xs" className="text-warning-500" />
              <span>{product.seller.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
