import { Link, Outlet } from 'react-router-dom';
import Logo from '@/components/atoms/Logo';
import Icon from '@/components/atoms/Icon';

/**
 * Minimal layout for checkout flow
 */
function CheckoutLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b py-4">
        <div className="container-page flex items-center justify-between">
          <Link to="/">
            <Logo size="md" />
          </Link>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Icon name="shield" size="sm" className="text-primary-800" />
            <span>Paiement securise</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-6">
        <div className="container-page">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-6">
              <Link to="/terms" className="hover:text-primary-800">
                Conditions d'utilisation
              </Link>
              <Link to="/privacy" className="hover:text-primary-800">
                Politique de confidentialite
              </Link>
              <Link to="/help" className="hover:text-primary-800">
                Aide
              </Link>
            </div>
            <p>&copy; {new Date().getFullYear()} Collector.shop</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default CheckoutLayout;
