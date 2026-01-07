import { clsx } from 'clsx';
import Icon from '@/components/atoms/Icon';
import Badge from '@/components/atoms/Badge';

export type RatingSize = 'sm' | 'md' | 'lg';

export interface RatingProps {
  /** Rating value (0-5) */
  value: number;
  /** Maximum rating value */
  maxValue?: number;
  /** Number of reviews */
  reviewCount?: number;
  /** Show review count */
  showCount?: boolean;
  /** Size variant */
  size?: RatingSize;
  /** Show trusted seller badge */
  isTrustedSeller?: boolean;
  /** Read-only mode (stars only, no interaction) */
  readonly?: boolean;
  /** Additional class names */
  className?: string;
}

const sizeStyles: Record<RatingSize, { icon: 'sm' | 'md' | 'lg'; text: string }> = {
  sm: { icon: 'sm', text: 'text-xs' },
  md: { icon: 'md', text: 'text-sm' },
  lg: { icon: 'lg', text: 'text-base' },
};

/**
 * Rating display component with stars
 */
function Rating({
  value,
  maxValue = 5,
  reviewCount,
  showCount = true,
  size = 'md',
  isTrustedSeller = false,
  readonly: _readonly = false,
  className,
}: Readonly<RatingProps>) {
  const styles = sizeStyles[size];
  const roundedValue = Math.round(value * 2) / 2; // Round to nearest 0.5
  const fullStars = Math.floor(roundedValue);
  const hasHalfStar = roundedValue % 1 !== 0;
  const emptyStars = maxValue - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={clsx('flex items-center gap-1.5', className)}>
      <div className="flex items-center" aria-label={`Note: ${value} sur ${maxValue}`}>
        {/* Full stars */}
        {Array.from({ length: fullStars }, (_, i) => (
          <Icon
            key={`full-${fullStars}-${i}`}
            name="star-solid"
            size={styles.icon}
            className="text-warning-500"
          />
        ))}

        {/* Half star - represented as a full star with lower opacity for simplicity */}
        {hasHalfStar && (
          <div className="relative">
            <Icon name="star" size={styles.icon} className="text-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Icon name="star-solid" size={styles.icon} className="text-warning-500" />
            </div>
          </div>
        )}

        {/* Empty stars */}
        {Array.from({ length: emptyStars }, (_, i) => (
          <Icon
            key={`empty-${emptyStars}-${i}`}
            name="star"
            size={styles.icon}
            className="text-gray-300"
          />
        ))}
      </div>

      <span className={clsx('font-medium text-accent', styles.text)}>
        {new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value)}
      </span>

      {showCount && reviewCount !== undefined && (
        <span className={clsx('text-gray-500', styles.text)}>
          ({reviewCount} avis)
        </span>
      )}

      {isTrustedSeller && (
        <Badge variant="success" size={size === 'lg' ? 'md' : 'sm'}>
          <Icon name="shield" size="xs" className="mr-0.5" />
          Vendeur de confiance
        </Badge>
      )}
    </div>
  );
}

export default Rating;
