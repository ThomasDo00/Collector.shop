import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Typography from '@/components/atoms/Typography';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Icon from '@/components/atoms/Icon';
import PriceDisplay from '@/components/molecules/PriceDisplay';

// Mock cart data
const MOCK_CART = {
  items: [
    {
      id: '1',
      productId: '1',
      title: 'Nike Air Max 1 "Patta Waves"',
      price: 450,
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200',
      seller: { username: 'sneakerhead42' },
    },
  ],
  subtotal: 450,
  commission: 22.5, // 5%
  shipping: 8.9,
  total: 481.4,
};

// Shipping validation schema
const shippingSchema = z.object({
  firstName: z.string().min(2, 'Prenom requis'),
  lastName: z.string().min(2, 'Nom requis'),
  address: z.string().min(5, 'Adresse requise'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'Ville requise'),
  postalCode: z.string().regex(/^\d{5}$/, 'Code postal invalide'),
  country: z.string().min(2, 'Pays requis'),
  phone: z.string().regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, 'Numero de telephone invalide'),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

type CheckoutStep = 'cart' | 'shipping' | 'payment';

const STEPS: { id: CheckoutStep; label: string; icon: string }[] = [
  { id: 'cart', label: 'Panier', icon: 'cart' },
  { id: 'shipping', label: 'Livraison', icon: 'truck' },
  { id: 'payment', label: 'Paiement', icon: 'card' },
];

/**
 * Checkout page with multi-step form
 */
function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('cart');
  const [shippingData, setShippingData] = useState<ShippingFormData | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      country: 'France',
    },
  });

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);

  const handleShippingSubmit = (data: ShippingFormData) => {
    setShippingData(data);
    setCurrentStep('payment');
  };

  const handlePayment = () => {
    // In real app, integrate with Stripe
    alert('Integration Stripe a venir !');
  };

  return (
    <div className="container-page py-8">
      {/* Progress Steps */}
      <div className="mb-12">
        <div className="flex items-center justify-center">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              {/* Step Circle */}
              <div
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full
                  transition-colors
                  ${index <= currentStepIndex
                    ? 'bg-primary-800 text-white'
                    : 'bg-gray-200 text-gray-500'
                  }
                `}
              >
                {index < currentStepIndex ? (
                  <Icon name="check" size="sm" />
                ) : (
                  <span className="font-medium">{index + 1}</span>
                )}
              </div>

              {/* Step Label */}
              <span
                className={`
                  hidden sm:block ml-3 font-medium
                  ${index <= currentStepIndex ? 'text-primary-800' : 'text-gray-500'}
                `}
              >
                {step.label}
              </span>

              {/* Connector */}
              {index < STEPS.length - 1 && (
                <div
                  className={`
                    w-16 sm:w-24 h-0.5 mx-4
                    ${index < currentStepIndex ? 'bg-primary-800' : 'bg-gray-200'}
                  `}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Cart Step */}
          {currentStep === 'cart' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <Typography variant="h3" className="mb-6">
                Votre panier
              </Typography>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {MOCK_CART.items.map(item => (
                  <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-gray-500">
                        Vendu par @{item.seller.username}
                      </p>
                      <p className="font-bold mt-2">
                        {item.price.toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: 'EUR',
                        })}
                      </p>
                    </div>
                    <button
                      className="text-gray-400 hover:text-error-500 transition-colors"
                      aria-label="Supprimer"
                    >
                      <Icon name="trash" size="md" />
                    </button>
                  </div>
                ))}
              </div>

              {MOCK_CART.items.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Icon name="cart" size="xl" className="mx-auto mb-4 opacity-50" />
                  <p>Votre panier est vide</p>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => setCurrentStep('shipping')}
                  rightIcon={<Icon name="arrow-right" size="sm" />}
                >
                  Continuer vers la livraison
                </Button>
              )}
            </div>
          )}

          {/* Shipping Step */}
          {currentStep === 'shipping' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <Typography variant="h3" className="mb-6">
                Adresse de livraison
              </Typography>

              <form onSubmit={handleSubmit(handleShippingSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    {...register('firstName')}
                    label="Prenom"
                    placeholder="Jean"
                    error={errors.firstName?.message}
                    required
                  />
                  <Input
                    {...register('lastName')}
                    label="Nom"
                    placeholder="Dupont"
                    error={errors.lastName?.message}
                    required
                  />
                </div>

                <Input
                  {...register('address')}
                  label="Adresse"
                  placeholder="123 Rue de Paris"
                  error={errors.address?.message}
                  required
                />

                <Input
                  {...register('addressLine2')}
                  label="Complement d'adresse"
                  placeholder="Appartement, etage, batiment..."
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    {...register('postalCode')}
                    label="Code postal"
                    placeholder="75001"
                    error={errors.postalCode?.message}
                    required
                  />
                  <Input
                    {...register('city')}
                    label="Ville"
                    placeholder="Paris"
                    error={errors.city?.message}
                    required
                  />
                </div>

                <Input
                  {...register('country')}
                  label="Pays"
                  placeholder="France"
                  error={errors.country?.message}
                  required
                />

                <Input
                  {...register('phone')}
                  type="tel"
                  label="Telephone"
                  placeholder="06 12 34 56 78"
                  error={errors.phone?.message}
                  helpText="Pour le suivi de livraison"
                  required
                />

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep('cart')}
                    leftIcon={<Icon name="arrow-left" size="sm" />}
                  >
                    Retour
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                    rightIcon={<Icon name="arrow-right" size="sm" />}
                  >
                    Continuer vers le paiement
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Payment Step */}
          {currentStep === 'payment' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <Typography variant="h3" className="mb-6">
                Paiement
              </Typography>

              {/* Shipping Summary */}
              {shippingData && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Adresse de livraison</span>
                    <button
                      onClick={() => setCurrentStep('shipping')}
                      className="text-primary-800 text-sm hover:underline"
                    >
                      Modifier
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">
                    {shippingData.firstName} {shippingData.lastName}<br />
                    {shippingData.address}<br />
                    {shippingData.addressLine2 && <>{shippingData.addressLine2}<br /></>}
                    {shippingData.postalCode} {shippingData.city}<br />
                    {shippingData.country}
                  </p>
                </div>
              )}

              {/* Payment Form Placeholder */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
                <Icon name="card" size="xl" className="mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 mb-2">
                  Integration Stripe Elements
                </p>
                <p className="text-sm text-gray-400">
                  Les champs de carte bancaire seront affiches ici
                </p>
              </div>

              {/* Security Info */}
              <div className="flex items-center gap-3 p-4 bg-primary-50 rounded-lg mb-6">
                <Icon name="shield" size="md" className="text-primary-800" />
                <div>
                  <p className="font-medium text-primary-800">Paiement 100% securise</p>
                  <p className="text-sm text-primary-700">
                    Vos donnees sont chiffrees et protegees par Stripe
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('shipping')}
                  leftIcon={<Icon name="arrow-left" size="sm" />}
                >
                  Retour
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handlePayment}
                >
                  Payer {MOCK_CART.total.toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                  })}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
            <Typography variant="h4" className="mb-6">
              Recapitulatif
            </Typography>

            {/* Items Summary */}
            <div className="space-y-3 mb-6">
              {MOCK_CART.items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 line-clamp-1 flex-1 mr-2">
                    {item.title}
                  </span>
                  <span className="font-medium">
                    {item.price.toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                    })}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sous-total</span>
                <span>
                  {MOCK_CART.subtotal.toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Commission (5%)</span>
                <span>
                  {MOCK_CART.commission.toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Livraison</span>
                <span>
                  {MOCK_CART.shipping.toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                  })}
                </span>
              </div>
            </div>

            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between">
                <span className="font-semibold">Total</span>
                <PriceDisplay price={MOCK_CART.total} size="lg" />
              </div>
            </div>

            {/* Trust Badges */}
            <div className="mt-6 pt-6 border-t">
              <div className="grid grid-cols-2 gap-4 text-center text-xs text-gray-500">
                <div>
                  <Icon name="shield" size="md" className="mx-auto mb-1 text-primary-800" />
                  <p>Protection acheteur</p>
                </div>
                <div>
                  <Icon name="truck" size="md" className="mx-auto mb-1 text-primary-800" />
                  <p>Livraison suivie</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
