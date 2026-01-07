import { clsx } from 'clsx';

export type SpinnerSize = 'sm' | 'md' | 'lg';
export type SpinnerColor = 'primary' | 'white';

export interface SpinnerProps {
  /** Spinner size */
  size?: SpinnerSize;
  /** Spinner color */
  color?: SpinnerColor;
  /** Additional class names */
  className?: string;
  /** Accessible label */
  label?: string;
}

const sizeStyles: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-3',
};

const colorStyles: Record<SpinnerColor, string> = {
  primary: 'border-primary-800 border-t-transparent',
  white: 'border-white border-t-transparent',
};

/**
 * Loading spinner component
 */
function Spinner({
  size = 'md',
  color = 'primary',
  className,
  label = 'Chargement...',
}: Readonly<SpinnerProps>) {
  return (
    <output
      aria-label={label}
      aria-live="polite"
      className={clsx(
        'animate-spin rounded-full',
        sizeStyles[size],
        colorStyles[color],
        className
      )}
    >
      <span className="sr-only">{label}</span>
    </output>
  );
}

export default Spinner;
