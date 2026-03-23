// TODO(temp): Page temporaire pour la suppression de produits en prod — à supprimer après nettoyage
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Typography from '@/components/atoms/Typography';
import Badge from '@/components/atoms/Badge';
import { apiClient } from '@/services/api/client';
import { useAppSelector } from '@/store';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { logger } from '@/core/logger';

interface Product {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  condition: string;
  status: string;
  category: string;
  sellerUsername: string;
  createdAt: string;
}

const STATUS_VARIANTS: Record<string, 'success' | 'neutral' | 'info' | 'warning' | 'error'> = {
  active: 'success',
  sold: 'neutral',
  pending: 'warning',
  expired: 'info',
};

export default function AdminProductsPage() {
  const currentUser = useAppSelector(selectCurrentUser);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/catalog/products', { params: { limit: 200 } });
        const data = res.data;
        const items = Array.isArray(data) ? data : (data.data ?? data.products ?? []);
        setProducts(items);
      } catch (err) {
        logger.error('AdminProductsPage: failed to load products', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!globalThis.confirm(`Supprimer "${title}" ? Cette action est irréversible.`)) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`/catalog/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      logger.error('AdminProductsPage: failed to delete product', err);
      globalThis.alert('Échec de la suppression.');
    } finally {
      setDeletingId(null);
    }
  };

  if (!currentUser) {
    return (
      <div className="container-page py-12 text-center">
        <Typography variant="h2">Connecte-toi pour accéder à cette page.</Typography>
      </div>
    );
  }

  const filtered = products.filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.sellerUsername?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container-page py-8">
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <Typography variant="h1">Admin — Produits ({products.length})</Typography>
        <input
          type="text"
          placeholder="Filtrer par titre ou vendeur…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary-800"
        />
      </div>

      {loading && <p className="text-gray-500">Chargement…</p>}

      {!loading && filtered.length === 0 && (
        <p className="text-gray-500">Aucun produit trouvé.</p>
      )}

      <div className="space-y-3">
        {filtered.map((product) => (
          <div
            key={product.id}
            className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg p-3"
          >
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-14 h-14 object-cover rounded-md flex-shrink-0"
              />
            )}

            <div className="flex-1 min-w-0">
              <Link
                to={`/product/${product.id}`}
                className="font-medium text-gray-900 hover:text-primary-800 truncate block"
              >
                {product.title}
              </Link>
              <p className="text-sm text-gray-500">
                Vendeur : <span className="font-medium">{product.sellerUsername ?? '—'}</span>
                {' · '}
                {product.price != null ? `${Number(product.price).toFixed(2)} €` : ''}
                {' · '}
                {product.category ?? ''}
              </p>
            </div>

            <Badge variant={STATUS_VARIANTS[product.status] ?? 'neutral'}>
              {product.status}
            </Badge>

            <button
              onClick={() => handleDelete(product.id, product.title)}
              disabled={deletingId === product.id}
              className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 flex-shrink-0"
            >
              {deletingId === product.id ? '…' : 'Supprimer'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
