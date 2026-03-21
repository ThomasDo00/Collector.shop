import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Typography from '@/components/atoms/Typography';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import { apiClient } from '@/services/api/client';
import { useAppSelector } from '@/store';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { logger } from '@/core/logger';

interface Listing {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  condition: string;
  status: string;
  category: string;
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Actif',
  sold: 'Vendu',
  reserved: 'Réservé',
  inactive: 'Inactif',
};

const STATUS_VARIANTS: Record<string, 'success' | 'neutral' | 'info' | 'warning'> = {
  active: 'success',
  sold: 'neutral',
  reserved: 'info',
  inactive: 'warning',
};

const CONDITION_LABELS: Record<string, string> = {
  new: 'Neuf',
  like_new: 'Comme neuf',
  very_good: 'Très bon état',
  good: 'Bon état',
  acceptable: 'Acceptable',
};

function MyListingsPage() {
  const navigate = useNavigate();
  const currentUser = useAppSelector(selectCurrentUser);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser?.username) {
      setLoading(false);
      return;
    }

    const loadListings = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/users/profile/${currentUser.username}/listings`);
        setListings(response.data.data);
      } catch (error) {
        logger.error('Failed to load listings', error);
      } finally {
        setLoading(false);
      }
    };

    loadListings();
  }, [currentUser]);

  const handleDelete = async (id: string, title: string) => {
    if (globalThis.confirm(`Supprimer l'annonce "${title}" ? Cette action est irréversible.`)) {
      setDeletingId(id);
      try {
        await apiClient.delete(`/catalog/products/${id}`);
        setListings((prev) => prev.filter((l) => l.id !== id));
      } catch (error) {
        logger.error('Failed to delete listing', error);
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Typography variant="h2" className="mb-6">Mes annonces</Typography>
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Typography variant="h2">Mes annonces</Typography>
        <Button variant="primary" onClick={() => navigate('/sell')}>
          Publier une annonce
        </Button>
      </div>

      <p className="text-sm text-gray-500 mb-6">
        {listings.length} annonce{listings.length !== 1 ? 's' : ''}
      </p>

      {listings.length === 0 ? (
        <div className="text-center py-16">
          <Typography variant="h4" className="text-gray-500 mb-2">Vous n'avez pas encore d'annonces</Typography>
          <p className="text-gray-400 mb-6">Publiez votre premier article dès maintenant.</p>
          <Button variant="primary" onClick={() => navigate('/sell')}>
            Publier une annonce
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <div key={listing.id} className="flex gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
              <Link to={`/product/${listing.id}`}>
                <img
                  src={listing.imageUrl}
                  alt={listing.title}
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                />
              </Link>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <Link to={`/product/${listing.id}`}>
                    <p className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-2">
                      {listing.title}
                    </p>
                  </Link>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={STATUS_VARIANTS[listing.status] ?? 'neutral'}>
                      {STATUS_LABELS[listing.status] ?? listing.status}
                    </Badge>
                    <button
                      onClick={() => handleDelete(listing.id, listing.title)}
                      disabled={deletingId === listing.id}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                      aria-label={`Supprimer l'annonce ${listing.title}`}
                    >
                      {deletingId === listing.id ? '…' : '🗑'}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="font-bold text-indigo-600 text-base">
                    {listing.price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                  <span>{CONDITION_LABELS[listing.condition] ?? listing.condition}</span>
                  {listing.category && <span>{listing.category}</span>}
                  <span>
                    {new Date(listing.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyListingsPage;
