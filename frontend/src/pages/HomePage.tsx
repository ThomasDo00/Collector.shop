import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Typography from '@/components/atoms/Typography';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import { catalogService } from '@/services/catalog.service';
import { logger } from '@/core/logger';
import type { Category, ProductPreview } from '@/types';

/**
 * Get generic category image based on category slug
 */
function getCategoryImage(categorySlug: string): string {
  const categoryImages: Record<string, string> = {
    sneakers: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop&crop=center',
    figurines: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=400&fit=crop&crop=center',
    vinyl: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400&h=400&fit=crop&crop=center',
    posters: 'https://images.unsplash.com/photo-1489599651941-b7cc4708180e?w=400&h=400&fit=crop&crop=center',
    cards: 'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=400&h=400&fit=crop&crop=center',
    watches: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&crop=center',
  };

  return categoryImages[categorySlug] || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center';
}

/**
 * Home page
 */
function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductPreview[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [categoriesData, productsData] = await Promise.all([
          catalogService.getCategories(),
          catalogService.getProducts({ sort: 'recent' }), // Get recent products
        ]);
        setCategories(categoriesData);
        setFeaturedProducts(productsData.slice(0, 4)); // Take first 4 as featured
      } catch (error) {
        logger.error('Failed to load homepage data', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Typography variant="body" className="text-gray-500">
          Chargement...
        </Typography>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-hero-pattern text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/30" />

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="container-page relative py-20 md:py-32">
          <div className="max-w-2xl">
            <Typography
              variant="h1"
              className="text-white mb-6 animate-fade-in-up"
            >
              Trouvez votre prochain tresor
            </Typography>
            <Typography
              variant="body-lg"
              className="text-white/80 mb-8 animate-fade-in-up"
              style={{ animationDelay: '100ms' }}
            >
              La marketplace de reference pour les collectionneurs passionnes.
              Achetez et vendez des pieces uniques en toute securite.
            </Typography>
            <div
              className="flex flex-wrap gap-4 animate-fade-in-up"
              style={{ animationDelay: '200ms' }}
            >
              <Button
                variant="secondary"
                size="lg"
                rightIcon={<Icon name="arrow-right" size="sm" />}
                onClick={() => { globalThis.location.href = '/catalog'; }}
              >
                Explorer le catalogue
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="text-white border-white/30 hover:bg-white/10"
                onClick={() => { globalThis.location.href = '/sell'; }}
              >
                Vendre un article
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section bg-gray-50">
        <div className="container-page">
          <div className="flex items-center justify-between mb-8">
            <Typography variant="h3">Categories populaires</Typography>
            <Link
              to="/catalog"
              className="text-primary-800 font-medium hover:underline flex items-center gap-1"
            >
              Voir tout
              <Icon name="chevron-right" size="sm" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/catalog/${category.slug}`}
                className="group"
              >
                <div className="card card-hover overflow-hidden">
                  <div className="aspect-square relative">
                    <img
                      src={category.imageUrl || getCategoryImage(category.slug)}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-semibold">{category.name}</h3>
                      <p className="text-white/70 text-sm">{category.itemCount || category.productCount || 0} articles</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="section">
        <div className="container-page">
          <div className="flex items-center justify-between mb-8">
            <Typography variant="h3">Tendances du moment</Typography>
            <Link
              to="/catalog?sort=popular"
              className="text-primary-800 font-medium hover:underline flex items-center gap-1"
            >
              Voir tout
              <Icon name="chevron-right" size="sm" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="card card-interactive group"
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <button
                    className="absolute top-3 right-3 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.preventDefault();
                      logger.debug('Add to favorites', { productId: product.id });
                    }}
                    aria-label="Ajouter aux favoris"
                  >
                    <Icon name="heart" size="sm" className="text-gray-600" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-accent line-clamp-2 mb-1">
                    {product.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">@{product.seller.username}</p>
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
                        <span>{product.seller.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators Section */}
      <section className="section bg-primary-800 text-white">
        <div className="container-page">
          <div className="text-center mb-12">
            <Typography variant="h3" className="text-white mb-4">
              Pourquoi choisir Collector.shop ?
            </Typography>
            <Typography className="text-white/70 max-w-2xl mx-auto">
              Nous mettons tout en oeuvre pour vous offrir la meilleure
              experience d'achat et de vente d'objets de collection.
            </Typography>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="shield" size="xl" />
              </div>
              <h4 className="font-semibold text-lg mb-2">Paiement securise</h4>
              <p className="text-white/70 text-sm">
                Toutes les transactions sont protegees par notre systeme de paiement securise.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="check" size="xl" />
              </div>
              <h4 className="font-semibold text-lg mb-2">Vendeurs verifies</h4>
              <p className="text-white/70 text-sm">
                Chaque vendeur est verifie et note par notre communaute.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="truck" size="xl" />
              </div>
              <h4 className="font-semibold text-lg mb-2">Livraison suivie</h4>
              <p className="text-white/70 text-sm">
                Suivez votre commande en temps reel jusqu'a la livraison.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="chat" size="xl" />
              </div>
              <h4 className="font-semibold text-lg mb-2">Support 7j/7</h4>
              <p className="text-white/70 text-sm">
                Notre equipe est disponible pour repondre a toutes vos questions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section">
        <div className="container-page">
          <div className="bg-gray-50 rounded-2xl p-8 md:p-12 lg:p-16 text-center">
            <Typography variant="h3" className="mb-4">
              Pret a vendre vos pieces de collection ?
            </Typography>
            <Typography color="muted" className="mb-8 max-w-xl mx-auto">
              Rejoignez des milliers de vendeurs et touchez une communaute
              passionnee de collectionneurs.
            </Typography>
            <Button
              variant="primary"
              size="lg"
              rightIcon={<Icon name="arrow-right" size="sm" />}
              onClick={() => { globalThis.location.href = '/sell'; }}
            >
              Commencer a vendre
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
