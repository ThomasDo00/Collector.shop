import { clsx } from 'clsx';

export type PriceSize = 'sm' | 'md' | 'lg' | 'xl';

export interface PriceDisplayProps {
  /** Current price */
  price: number;
  /** Original price (for showing discount) */
  originalPrice?: number;
  /** Currency */
  currency?: string;
  /** Size variant */
  size?: PriceSize;
  /** Show platform commission (5%) */
  showCommission?: boolean;
  /** Additional class names */
  className?: string;
}

const sizeStyles: Record<PriceSize, { price: string; original: string; commission: string }> = {
  sm: {
    price: 'text-base font-semibold',
    original: 'text-sm',
    commission: 'text-xs',
  },
  md: {
    price: 'text-xl font-bold',
    original: 'text-base',
    commission: 'text-sm',
  },
  lg: {
    price: 'text-3xl font-bold',
    original: 'text-lg',
    commission: 'text-base',
  },
  xl: {
    price: 'text-4xl font-bold',
    original: 'text-xl',
    commission: 'text-lg',
  },
};

/**
 * Format price with currency
 */
function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculate discount percentage
 */
function calculateDiscount(price: number, originalPrice: number): number {
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

/**
 * Price display component with commission breakdown
 */
function PriceDisplay({
  price,
  originalPrice,
  currency = 'EUR',
  size = 'md',
  showCommission = false,
  className,
}: Readonly<PriceDisplayProps>) {
  const styles = sizeStyles[size];
  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercent = hasDiscount ? calculateDiscount(price, originalPrice) : 0;
  const commission = price * 0.05; // 5% platform fee
  const total = price + commission;

  return (
    <div className={clsx('flex flex-col', className)}>
      <div className="flex items-baseline gap-2">
        <span className={clsx(styles.price, 'text-accent')}>
          {formatPrice(price, currency)}
        </span>

        {hasDiscount && (
          <>
            <span className={clsx(styles.original, 'text-gray-400 line-through')}>
              {formatPrice(originalPrice, currency)}
            </span>
            <span className="badge-error text-xs font-medium">
              -{discountPercent}%
            </span>
          </>
        )}
      </div>

      {showCommission && (
        <div className={clsx('mt-1 text-gray-500', styles.commission)}>
          <div className="flex justify-between">
            <span>Frais de service (5%)</span>
            <span>+ {formatPrice(commission, currency)}</span>
          </div>
          <div className="flex justify-between font-medium text-accent mt-1 pt-1 border-t border-gray-200">
            <span>Total</span>
            <span>{formatPrice(total, currency)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default PriceDisplay;
