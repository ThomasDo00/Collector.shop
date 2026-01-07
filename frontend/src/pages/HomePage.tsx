import { Link } from 'react-router-dom';
import Typography from '@/components/atoms/Typography';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';

// Placeholder categories until backend is ready
const CATEGORIES = [
  { id: '1', name: 'Sneakers', slug: 'sneakers', imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=400', itemCount: 234 },
  { id: '2', name: 'Figurines', slug: 'figurines', imageUrl: 'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=400', itemCount: 156 },
  { id: '3', name: 'Vinyles', slug: 'vinyl', imageUrl: 'https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?w=400', itemCount: 89 },
  { id: '4', name: 'Posters', slug: 'posters', imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400', itemCount: 167 },
  { id: '5', name: 'Cartes', slug: 'cards', imageUrl: 'https://images.unsplash.com/photo-1606503153255-59d7e10e6b5e?w=400', itemCount: 312 },
  { id: '6', name: 'Montres', slug: 'watches', imageUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400', itemCount: 45 },
];

// Placeholder featured products
const FEATURED_PRODUCTS = [
  { id: '1', title: 'Nike Air Max 1 "Patta"', price: 450, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', seller: 'sneakerhead42', rating: 4.9 },
  { id: '2', title: 'Figurine Dragon Ball Z Goku', price: 180, imageUrl: 'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=400', seller: 'collector_pro', rating: 4.8 },
  { id: '3', title: 'Vinyle Pink Floyd - The Wall', price: 75, imageUrl: 'https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?w=400', seller: 'vinyl_addict', rating: 5 },
  { id: '4', title: 'Poster Star Wars Original', price: 220, imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400', seller: 'movie_buff', rating: 4.7 },
];

/**
 * Home page
 */
function HomePage() {
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
            {CATEGORIES.map((category) => (
              <Link
                key={category.id}
                to={`/catalog/${category.slug}`}
                className="group"
              >
                <div className="card card-hover overflow-hidden">
                  <div className="aspect-square relative">
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-semibold">{category.name}</h3>
                      <p className="text-white/70 text-sm">{category.itemCount} articles</p>
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
            {FEATURED_PRODUCTS.map((product) => (
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
                      console.log('Add to favorites:', product.id);
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
                  <p className="text-sm text-gray-500 mb-2">@{product.seller}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg text-accent">
                      {product.price.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </span>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Icon name="star-solid" size="xs" className="text-warning-500" />
                      <span>{product.rating}</span>
                    </div>
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
