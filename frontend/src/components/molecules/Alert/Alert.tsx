import { clsx } from 'clsx';
import { ReactNode } from 'react';
import Icon from '@/components/atoms/Icon';
import Button from '@/components/atoms/Button';

export type AlertVariant = 'success' | 'warning' | 'error' | 'info';

export interface AlertProps {
  /** Alert style variant */
  variant: AlertVariant;
  /** Alert title */
  title?: string;
  /** Alert message */
  message: string;
  /** Show close button */
  onClose?: () => void;
  /** Action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Additional class names */
  className?: string;
  /** Children content */
  children?: ReactNode;
}

const variantStyles: Record<AlertVariant, { bg: string; border: string; icon: string }> = {
  success: {
    bg: 'bg-success-50',
    border: 'border-success-500',
    icon: 'text-success-600',
  },
  warning: {
    bg: 'bg-warning-50',
    border: 'border-warning-500',
    icon: 'text-warning-600',
  },
  error: {
    bg: 'bg-error-50',
    border: 'border-error-500',
    icon: 'text-error-600',
  },
  info: {
    bg: 'bg-info-50',
    border: 'border-info-500',
    icon: 'text-info-600',
  },
};

const variantIcons: Record<AlertVariant, 'success' | 'warning' | 'error' | 'info'> = {
  success: 'success',
  warning: 'warning',
  error: 'error',
  info: 'info',
};

/**
 * Alert component for notifications and messages
 */
function Alert({
  variant,
  title,
  message,
  onClose,
  action,
  className,
  children,
}: AlertProps) {
  const styles = variantStyles[variant];

  return (
    <div
      role="alert"
      className={clsx(
        'rounded-lg border-l-4 p-4',
        styles.bg,
        styles.border,
        className
      )}
    >
      <div className="flex">
        <div className={clsx('flex-shrink-0', styles.icon)}>
          <Icon name={variantIcons[variant]} size="md" />
        </div>

        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium text-accent">{title}</h3>
          )}
          <p className={clsx('text-sm text-gray-700', title && 'mt-1')}>
            {message}
          </p>
          {children && <div className="mt-2">{children}</div>}

          {action && (
            <div className="mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={action.onClick}
                className="text-accent font-medium hover:bg-transparent hover:underline px-0"
              >
                {action.label}
              </Button>
            </div>
          )}
        </div>

        {onClose && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-800 focus-visible:ring-offset-2"
              aria-label="Fermer"
            >
              <Icon name="close" size="sm" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Alert;
