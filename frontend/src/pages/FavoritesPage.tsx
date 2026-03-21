import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Typography from '@/components/atoms/Typography';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import { favoritesService } from '@/services/favorites.service';
import { logger } from '@/core/logger';
import type { ProductPreview } from '@/types';

function FavoritesPage() {
  const [favorites, setFavorites] = useState<ProductPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        setLoading(true);
        const data = await favoritesService.getFavorites();
        setFavorites(data);
      } catch (error) {
        logger.error('Failed to load favorites', error);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  const handleRemove = async (productId: string) => {
    setRemovingId(productId);
    try {
      await favoritesService.removeFavorite(productId);
      setFavorites((prev) => prev.filter((p) => p.id !== productId));
    } catch (error) {
      logger.error('Failed to remove favorite', error);
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Typography variant="h2" className="mb-6">Mes favoris</Typography>
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Typography variant="h2">Mes favoris</Typography>
        <span className="text-sm text-gray-500">{favorites.length} article{favorites.length !== 1 ? 's' : ''}</span>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-16">
          <Icon name="heart" size="xl" className="text-gray-300 mx-auto mb-4" />
          <Typography variant="h4" className="text-gray-500 mb-2">Aucun favori pour l'instant</Typography>
          <p className="text-gray-400 mb-6">Ajoutez des articles à vos favoris pour les retrouver facilement.</p>
          <Link to="/catalog">
            <Button variant="primary">Parcourir le catalogue</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((product) => (
            <div key={product.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <Link to={`/product/${product.id}`}>
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>

              <div className="p-4">
                <Link to={`/product/${product.id}`}>
                  <Typography variant="body" className="font-semibold text-gray-900 line-clamp-2 hover:text-indigo-600 transition-colors mb-1">
                    {product.title}
                  </Typography>
                </Link>
                <p className="text-indigo-600 font-bold text-lg mb-3">
                  {product.price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </p>

                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => handleRemove(product.id)}
                  disabled={removingId === product.id}
                  leftIcon={<Icon name="heart-solid" size="sm" className="text-red-500" />}
                >
                  {removingId === product.id ? 'Retrait...' : 'Retirer des favoris'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FavoritesPage;
