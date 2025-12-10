import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input label */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helpText?: string;
  /** Icon on the left */
  leftIcon?: ReactNode;
  /** Icon on the right */
  rightIcon?: ReactNode;
  /** Full width input */
  fullWidth?: boolean;
}

/**
 * Input component with label and error states
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helpText,
      leftIcon,
      rightIcon,
      fullWidth = true,
      className,
      id,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name;
    const hasError = Boolean(error);

    return (
      <div className={clsx('flex flex-col', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-accent mb-1.5"
          >
            {label}
            {required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined
            }
            className={clsx(
              'w-full px-4 py-3 bg-white border rounded-md',
              'text-accent placeholder:text-gray-400',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:border-transparent',
              'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
              hasError
                ? 'border-error-500 focus:ring-error-500'
                : 'border-gray-300 focus:ring-primary-800 focus:border-primary-800',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>

        {hasError && (
          <p
            id={`${inputId}-error`}
            className="text-sm text-error-500 mt-1.5"
            role="alert"
          >
            {error}
          </p>
        )}

        {helpText && !hasError && (
          <p id={`${inputId}-help`} className="text-sm text-gray-500 mt-1.5">
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
