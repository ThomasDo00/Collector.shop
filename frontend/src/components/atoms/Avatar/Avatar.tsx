import { clsx } from 'clsx';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  /** Image source URL */
  src?: string | null;
  /** Alt text for the image */
  alt: string;
  /** Avatar size */
  size?: AvatarSize;
  /** Fallback initials (first letter of name) */
  fallback?: string;
  /** Show online status indicator */
  showStatus?: boolean;
  /** Online status */
  isOnline?: boolean;
  /** Additional class names */
  className?: string;
}

const sizeStyles: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
};

const statusSizes: Record<AvatarSize, string> = {
  xs: 'w-1.5 h-1.5 border',
  sm: 'w-2 h-2 border',
  md: 'w-2.5 h-2.5 border-2',
  lg: 'w-3 h-3 border-2',
  xl: 'w-4 h-4 border-2',
};

/**
 * Get initials from a name or username
 */
function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Avatar component with image or fallback initials
 */
function Avatar({
  src,
  alt,
  size = 'md',
  fallback,
  showStatus = false,
  isOnline = false,
  className,
}: AvatarProps) {
  const initials = getInitials(fallback || alt);

  return (
    <div className={clsx('relative inline-block', className)}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={clsx(
            'rounded-full object-cover bg-gray-100',
            sizeStyles[size]
          )}
          loading="lazy"
        />
      ) : (
        <div
          className={clsx(
            'rounded-full bg-primary-100 text-primary-800 font-medium',
            'flex items-center justify-center',
            sizeStyles[size]
          )}
          aria-label={alt}
        >
          {initials}
        </div>
      )}

      {showStatus && (
        <span
          className={clsx(
            'absolute bottom-0 right-0 rounded-full border-white',
            isOnline ? 'bg-success-500' : 'bg-gray-400',
            statusSizes[size]
          )}
          aria-label={isOnline ? 'En ligne' : 'Hors ligne'}
        />
      )}
    </div>
  );
}

export default Avatar;
