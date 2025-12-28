import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import Icon from '@/components/atoms/Icon';

export interface BreadcrumbItem {
  /** Item label */
  label: string;
  /** Item link (optional, last item usually doesn't have link) */
  href?: string;
}

export interface BreadcrumbProps {
  /** Breadcrumb items */
  items: BreadcrumbItem[];
  /** Additional class names */
  className?: string;
}

/**
 * Breadcrumb navigation component
 */
function Breadcrumb({ items, className }: Readonly<BreadcrumbProps>) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Fil d'Ariane" className={clsx('flex items-center', className)}>
      <ol className="flex items-center gap-1 text-sm">
        {/* Home link */}
        <li className="flex items-center">
          <Link
            to="/"
            className="text-gray-500 hover:text-primary-800 transition-colors"
            aria-label="Accueil"
          >
            <Icon name="home" size="sm" />
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.label} className="flex items-center">
              <Icon
                name="chevron-right"
                size="xs"
                className="mx-1 text-gray-400"
              />

              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className="text-gray-500 hover:text-primary-800 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={clsx(
                    isLast ? 'text-accent font-medium' : 'text-gray-500'
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
