import { Link } from 'react-router-dom';
import { clsx } from 'clsx';

export type LogoSize = 'sm' | 'md' | 'lg';

export interface LogoProps {
  /** Logo size */
  size?: LogoSize;
  /** Show text alongside logo */
  showText?: boolean;
  /** Link to home page */
  linkToHome?: boolean;
  /** Additional class names */
  className?: string;
  /** Override text color (defaults to text-accent) */
  textClassName?: string;
}

const sizeStyles: Record<LogoSize, { icon: string; text: string }> = {
  sm: { icon: 'w-6 h-6', text: 'text-lg' },
  md: { icon: 'w-8 h-8', text: 'text-xl' },
  lg: { icon: 'w-10 h-10', text: 'text-2xl' },
};

/**
 * Logo component for Collector.shop
 */
function Logo({
  size = 'md',
  showText = true,
  linkToHome = true,
  className,
  textClassName,
}: Readonly<LogoProps>) {
  const logoContent = (
    <div
      className={clsx(
        'inline-flex items-center gap-2',
        className
      )}
    >
      {/* Logo Icon - Stylized "C" with collector/vintage feel */}
      <div
        className={clsx(
          'bg-primary-800 text-white rounded-lg flex items-center justify-center font-display font-bold',
          sizeStyles[size].icon
        )}
      >
        C
      </div>

      {showText && (
        <span
          className={clsx(
            'font-display font-semibold tracking-tight',
            textClassName ?? 'text-accent',
            sizeStyles[size].text
          )}
        >
          Collector<span className="text-primary-800">.shop</span>
        </span>
      )}
    </div>
  );

  if (linkToHome) {
    return (
      <Link
        to="/"
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-800 focus-visible:ring-offset-2 rounded"
        aria-label="Collector.shop - Accueil"
      >
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}

export default Logo;
