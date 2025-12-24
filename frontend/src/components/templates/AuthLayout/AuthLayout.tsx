import { Outlet, Link } from 'react-router-dom';
import Logo from '@/components/atoms/Logo';

/**
 * Auth layout for login/register pages
 */
function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-hero-pattern relative">
        {/* Overlay pattern */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <Logo size="lg" linkToHome />

          <div className="max-w-md">
            <h1 className="text-4xl xl:text-5xl font-display font-bold leading-tight mb-6">
              Decouvrez des pieces uniques
            </h1>
            <p className="text-lg text-white/80 leading-relaxed">
              Rejoignez la communaute des collectionneurs passionnes.
              Achetez et vendez vos objets de collection en toute securite.
            </p>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap gap-6 text-sm text-white/70">
            <span>✓ Paiements securises</span>
            <span>✓ Protection acheteur</span>
            <span>✓ Support 7j/7</span>
          </div>
        </div>

        {/* Decorative shapes */}
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-tl-full" />
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-white/5 rounded-full" />
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-100">
          <Logo size="sm" />
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-primary-800 transition-colors"
          >
            Retour a l'accueil
          </Link>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 text-center text-sm text-gray-500 border-t border-gray-100">
          <p>
            © {new Date().getFullYear()} Collector.shop.{' '}
            <Link to="/terms" className="hover:text-primary-800 transition-colors">
              CGU
            </Link>
            {' · '}
            <Link to="/privacy" className="hover:text-primary-800 transition-colors">
              Confidentialite
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
