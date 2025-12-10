import { ElementType, HTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'body'
  | 'body-lg'
  | 'body-sm'
  | 'caption'
  | 'label';

export interface TypographyProps extends HTMLAttributes<HTMLElement> {
  /** Typography variant */
  variant?: TypographyVariant;
  /** HTML element to render as */
  as?: ElementType;
  /** Text color */
  color?: 'default' | 'muted' | 'primary' | 'error' | 'success';
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Additional class names */
  className?: string;
  /** Content */
  children: ReactNode;
}

const variantStyles: Record<TypographyVariant, string> = {
  h1: 'font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight',
  h2: 'font-display text-3xl md:text-4xl font-semibold tracking-tight',
  h3: 'font-display text-2xl md:text-3xl font-semibold tracking-tight',
  h4: 'font-display text-xl md:text-2xl font-semibold',
  'body-lg': 'text-lg leading-relaxed',
  body: 'text-base leading-relaxed',
  'body-sm': 'text-sm leading-relaxed',
  caption: 'text-xs',
  label: 'text-sm font-medium',
};

const colorStyles: Record<string, string> = {
  default: 'text-accent',
  muted: 'text-gray-500',
  primary: 'text-primary-800',
  error: 'text-error-500',
  success: 'text-success-600',
};

const alignStyles: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const defaultElements: Record<TypographyVariant, ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  'body-lg': 'p',
  body: 'p',
  'body-sm': 'p',
  caption: 'span',
  label: 'span',
};

/**
 * Typography component for consistent text styling
 */
function Typography({
  variant = 'body',
  as,
  color = 'default',
  align = 'left',
  className,
  children,
  ...props
}: TypographyProps) {
  const Component = as || defaultElements[variant];

  return (
    <Component
      className={clsx(
        variantStyles[variant],
        colorStyles[color],
        alignStyles[align],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export default Typography;
