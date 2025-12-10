import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';
import Spinner from '../Spinner/Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button style variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Show loading spinner */
  isLoading?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Icon on the left */
  leftIcon?: ReactNode;
  /** Icon on the right */
  rightIcon?: ReactNode;
  /** Accessible label for icon-only buttons */
  ariaLabel?: string;
  /** Children content */
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary-800 text-white hover:bg-primary-900 active:bg-primary-950 focus-visible:ring-primary-800',
  secondary: 'bg-white text-primary-800 border-2 border-primary-800 hover:bg-primary-50 active:bg-primary-100 focus-visible:ring-primary-800',
  outline: 'bg-transparent text-accent border border-accent/20 hover:border-accent hover:bg-accent hover:text-white focus-visible:ring-accent',
  ghost: 'text-primary-800 hover:bg-primary-50 active:bg-primary-100 focus-visible:ring-primary-800',
  danger: 'bg-error-500 text-white hover:bg-error-600 active:bg-red-700 focus-visible:ring-error-500',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'text-sm px-4 py-2',
  md: 'text-base px-6 py-3',
  lg: 'text-lg px-8 py-4',
};

/**
 * Button component with multiple variants and sizes
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      ariaLabel,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-label={ariaLabel}
        aria-busy={isLoading}
        className={clsx(
          // Base styles
          'inline-flex items-center justify-center gap-2 font-medium rounded-md',
          'transition-all duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          // Variant styles
          variantStyles[variant],
          // Size styles
          sizeStyles[size],
          // Full width
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <Spinner size="sm" color={variant === 'primary' || variant === 'danger' ? 'white' : 'primary'} />
            <span className="sr-only">Chargement...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
