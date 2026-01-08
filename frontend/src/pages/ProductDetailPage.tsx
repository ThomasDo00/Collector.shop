import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Typography from '@/components/atoms/Typography';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Avatar from '@/components/atoms/Avatar';
import Icon from '@/components/atoms/Icon';
import Breadcrumb from '@/components/molecules/Breadcrumb';
import Rating from '@/components/molecules/Rating';
import PriceDisplay from '@/components/molecules/PriceDisplay';
import ProductGrid from '@/components/organisms/ProductGrid';
import type { ProductPreview } from '@/types';

// Mock product data
const MOCK_PRODUCT = {
  id: '1',
  title: 'Nike Air Max 1 "Patta Waves" - Monarch',
  description: `Edition limitee issue de la collaboration entre Nike et Patta, le celebre shop de streetwear d'Amsterdam.

Ce modele "Waves" arbore le fameux motif ondule sur les panneaux lateraux, devenu iconique de cette collaboration. Coloris "Monarch" avec des nuances de orange, marron et blanc casse.

Taille: 42.5 EU / 9 US
Etat: Neuf avec boite d'origine
Provenance: SNKRS EU
Date d'achat: Mars 2022

La paire n'a jamais ete portee, livree avec le papier de soie et les lacets supplementaires d'origine.`,
  price: 450,
  images: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800',
    'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800',
  ],
  category: 'Sneakers',
  condition: 'new' as const,
  status: 'active' as const,
  seller: {
    id: '1',
    username: 'sneakerhead42',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    rating: 4.9,
    salesCount: 127,
    memberSince: '2021',
    responseTime: '< 1 heure',
  },
  createdAt: '2024-01-15',
  views: 342,
};

// Mock similar products
const SIMILAR_PRODUCTS: ProductPreview[] = [
  { id: '5', title: 'Nike Dunk Low "Panda"', price: 180, imageUrl: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400', category: 'Sneakers', condition: 'new', status: 'active', seller: { id: '5', username: 'kicks_dealer', rating: 4.6 }, createdAt: '2024-01-11' },
  { id: '11', title: 'Nike Air Jordan 1 "Chicago" 2015', price: 850, imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=400', category: 'Sneakers', condition: 'very_good', status: 'active', seller: { id: '11', username: 'jordan_king', rating: 4.9 }, createdAt: '2024-01-05' },
  { id: '13', title: 'Adidas Yeezy Boost 350 V2 "Zebra"', price: 320, imageUrl: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=400', category: 'Sneakers', condition: 'like_new', status: 'active', seller: { id: '13', username: 'yeezy_fan', rating: 4.7 }, createdAt: '2024-01-03' },
  { id: '14', title: 'New Balance 550 "White Green"', price: 160, imageUrl: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=400', category: 'Sneakers', condition: 'new', status: 'active', seller: { id: '14', username: 'nb_collector', rating: 4.5 }, createdAt: '2024-01-02' },
];

const CONDITION_LABELS: Record<string, string> = {
  new: 'Neuf',
  like_new: 'Comme neuf',
  very_good: 'Tres bon',
  good: 'Bon',
  fair: 'Correct',
};

/**
 * Product detail page
 */
function ProductDetailPage() {
  const { id: _id } = useParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // In real app, fetch product by id
  const product = MOCK_PRODUCT;

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Catalogue', href: '/catalog' },
    { label: product.category, href: `/catalog/${product.category.toLowerCase()}` },
    { label: product.title },
  ];

  return (
    <div className="min-h-screen bg-white" data-product-id={_id}>
      {/* Breadcrumb */}
      <div className="border-b bg-gray-50">
        <div className="container-page py-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* Main Content */}
      <div className="container-page py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div>
            {/* Main Image */}
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
              <img
                src={product.images[selectedImage]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3">
              {product.images.map((image, index) => (
                <button
                  key={image}
                  onClick={() => setSelectedImage(index)}
                  className={`
                    w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors
                    ${selectedImage === index ? 'border-primary-800' : 'border-transparent hover:border-gray-300'}
                  `}
                >
                  <img
                    src={image}
                    alt={`${product.title} - Vue ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            {/* Status & Category */}
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="primary">{product.category}</Badge>
              <Badge
                variant={(() => {
                  if (product.condition === 'new') return 'success';
                  if (product.condition === 'like_new') return 'info';
                  return 'neutral';
                })()}
              >
                {CONDITION_LABELS[product.condition]}
              </Badge>
            </div>

            {/* Title */}
            <Typography variant="h2" className="mb-4">
              {product.title}
            </Typography>

            {/* Price */}
            <div className="mb-6">
              <PriceDisplay
                price={product.price}
                size="xl"
                showCommission
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 mb-8">
              <Button variant="primary" size="lg" className="flex-1">
                Acheter maintenant
              </Button>
              <Button
                variant={isFavorite ? 'secondary' : 'outline'}
                size="lg"
                onClick={() => setIsFavorite(!isFavorite)}
                aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              >
                <Icon name={isFavorite ? 'heart-solid' : 'heart'} size="md" />
              </Button>
            </div>

            {/* Seller Card */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-4">
                <Avatar
                  src={product.seller.avatarUrl}
                  alt={product.seller.username}
                  size="lg"
                />
                <div className="flex-1">
                  <Link
                    to={`/profile/${product.seller.username}`}
                    className="font-semibold text-accent hover:text-primary-800 transition-colors"
                  >
                    @{product.seller.username}
                  </Link>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Rating value={product.seller.rating} size="sm" readonly />
                      <span>({product.seller.rating})</span>
                    </div>
                    <span>{product.seller.salesCount} ventes</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Membre depuis {product.seller.memberSince}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Temps de reponse</p>
                  <p className="font-medium">{product.seller.responseTime}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Taux de reponse</p>
                  <p className="font-medium">98%</p>
                </div>
              </div>

              <Button
                variant="outline"
                fullWidth
                leftIcon={<Icon name="chat" size="sm" />}
                className="mt-4"
              >
                Contacter le vendeur
              </Button>
            </div>

            {/* Product Details */}
            <div className="space-y-4">
              <Typography variant="h4">Description</Typography>
              <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-line">
                {product.description}
              </div>
            </div>

            {/* Meta Info */}
            <div className="mt-8 pt-6 border-t text-sm text-gray-500">
              <div className="flex justify-between">
                <span>Publie le {new Date(product.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}</span>
                <span>{product.views} vues</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <section className="bg-gray-50 py-8">
        <div className="container-page">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <Icon name="shield" size="lg" className="text-primary-800 mx-auto mb-2" />
              <p className="font-medium">Paiement securise</p>
              <p className="text-sm text-gray-500">Protection acheteur</p>
            </div>
            <div>
              <Icon name="check" size="lg" className="text-primary-800 mx-auto mb-2" />
              <p className="font-medium">Vendeur verifie</p>
              <p className="text-sm text-gray-500">Identite confirmee</p>
            </div>
            <div>
              <Icon name="truck" size="lg" className="text-primary-800 mx-auto mb-2" />
              <p className="font-medium">Livraison suivie</p>
              <p className="text-sm text-gray-500">Suivi en temps reel</p>
            </div>
            <div>
              <Icon name="chat" size="lg" className="text-primary-800 mx-auto mb-2" />
              <p className="font-medium">Support 7j/7</p>
              <p className="text-sm text-gray-500">Aide disponible</p>
            </div>
          </div>
        </div>
      </section>

      {/* Similar Products */}
      <section className="py-12">
        <div className="container-page">
          <div className="flex items-center justify-between mb-8">
            <Typography variant="h3">Articles similaires</Typography>
            <Link
              to={`/catalog/${product.category.toLowerCase()}`}
              className="text-primary-800 font-medium hover:underline flex items-center gap-1"
            >
              Voir tout
              <Icon name="chevron-right" size="sm" />
            </Link>
          </div>

          <ProductGrid products={SIMILAR_PRODUCTS} columns={4} />
        </div>
      </section>
    </div>
  );
}

export default ProductDetailPage;
