import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Typography from '@/components/atoms/Typography';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import { cartService, type Cart } from '@/services/cart.service';
import { useAppSelector } from '@/store';
import { selectCurrentUser, selectIsAuthenticated } from '@/features/auth/authSlice';
import { logger } from '@/core/logger';

function CartPage() {
  const navigate = useNavigate();
  const currentUser = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      setLoading(false);
      return;
    }

    const loadCart = async () => {
      try {
        setLoading(true);
        const data = await cartService.getCart(currentUser.id);
        setCart(data);
      } catch (error) {
        logger.error('Failed to load cart', error);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [isAuthenticated, currentUser]);

  const handleRemoveItem = async (itemId: string) => {
    if (!currentUser) return;
    setRemovingId(itemId);
    try {
      await cartService.removeItem(currentUser.id, itemId);
      setCart((prev) => {
        if (!prev) return prev;
        const updatedItems = prev.items.filter((item) => item.id !== itemId);
        const subtotal = updatedItems.reduce((sum, item) => sum + item.price * (item.quantity ?? 1), 0);
        const commission = Math.round(subtotal * 0.05 * 100) / 100;
        const shipping = updatedItems.length > 0 ? 8.9 : 0;
        return {
          ...prev,
          items: updatedItems,
          subtotal: Math.round(subtotal * 100) / 100,
          commission,
          shipping,
          total: Math.round((subtotal + commission + shipping) * 100) / 100,
        };
      });
    } catch (error) {
      logger.error('Failed to remove item', error);
    } finally {
      setRemovingId(null);
    }
  };

  const handleClearCart = async () => {
    if (!currentUser) return;
    setClearing(true);
    try {
      await cartService.clearCart(currentUser.id);
      setCart((prev) =>
        prev ? { ...prev, items: [], subtotal: 0, commission: 0, shipping: 0, total: 0 } : prev,
      );
    } catch (error) {
      logger.error('Failed to clear cart', error);
    } finally {
      setClearing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Typography variant="h2" className="mb-6">Mon panier</Typography>
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Typography variant="h2" className="mb-6">Mon panier</Typography>
        <div className="text-center py-16">
          <Icon name="cart" size="xl" className="text-gray-300 mx-auto mb-4" />
          <Typography variant="h4" className="text-gray-500 mb-2">Votre panier est vide</Typography>
          <p className="text-gray-400 mb-6">Connectez-vous pour accéder à votre panier.</p>
          <Button variant="primary" onClick={() => navigate('/login')}>Se connecter</Button>
        </div>
      </div>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Typography variant="h2">Mon panier</Typography>
        {!isEmpty && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearCart}
            disabled={clearing}
          >
            {clearing ? 'Vidage...' : 'Vider le panier'}
          </Button>
        )}
      </div>

      {isEmpty ? (
        <div className="text-center py-16">
          <Icon name="cart" size="xl" className="text-gray-300 mx-auto mb-4" />
          <Typography variant="h4" className="text-gray-500 mb-2">Votre panier est vide</Typography>
          <p className="text-gray-400 mb-6">Ajoutez des articles depuis le catalogue.</p>
          <Link to="/catalog">
            <Button variant="primary">Parcourir le catalogue</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 bg-white rounded-lg border border-gray-200">
                <Link to={`/product/${item.productId}`}>
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.productId}`}>
                    <p className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-2">
                      {item.title}
                    </p>
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">Vendeur : {item.seller.username}</p>
                  <p className="text-indigo-600 font-bold mt-2">
                    {item.price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={removingId === item.id}
                  className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 p-1"
                  aria-label="Retirer du panier"
                >
                  <Icon name="close" size="sm" />
                </button>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
              <Typography variant="h4" className="mb-4">Récapitulatif</Typography>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sous-total</span>
                  <span>{cart.subtotal.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Commission (5%)</span>
                  <span>{cart.commission.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Livraison</span>
                  <span>{cart.shipping.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-200 mt-2">
                  <span>Total</span>
                  <span className="text-indigo-600">
                    {cart.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
              </div>
              <Button
                variant="primary"
                fullWidth
                onClick={() => navigate('/checkout')}
              >
                Passer à la commande
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;
