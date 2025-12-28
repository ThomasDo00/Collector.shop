import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import Logo from '@/components/atoms/Logo';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import Avatar from '@/components/atoms/Avatar';
import SearchBar from '@/components/molecules/SearchBar';
import { useAppSelector, useAppDispatch } from '@/store';
import { selectIsAuthenticated, selectCurrentUser, logout } from '@/features/auth/authSlice';

const NAV_LINKS = [
  { label: 'Catalogue', href: '/catalog' },
  { label: 'Categories', href: '/catalog', hasDropdown: true },
  { label: 'Vendre', href: '/sell' },
];

/**
 * Main header component with navigation
 */
function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/');
  };

  return (
    <header
      className={clsx(
        'sticky top-0 z-50 w-full transition-all duration-300',
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm'
          : 'bg-white'
      )}
    >
      <div className="container-page">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo size="md" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8" aria-label="Navigation principale">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className={clsx(
                  'text-sm font-medium transition-colors duration-200',
                  'hover:text-primary-800',
                  location.pathname === link.href
                    ? 'text-primary-800'
                    : 'text-accent'
                )}
              >
                <span className="flex items-center gap-1">
                  {link.label}
                  {link.hasDropdown && (
                    <Icon name="chevron-down" size="xs" />
                  )}
                </span>
              </Link>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              placeholder="Rechercher un article..."
              fullWidth
            />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Search Icon - Mobile */}
            <button
              className="md:hidden p-2 text-accent hover:text-primary-800 transition-colors"
              aria-label="Rechercher"
            >
              <Icon name="search" size="md" />
            </button>

            {/* Favorites */}
            {isAuthenticated && (
              <Link
                to="/favorites"
                className="p-2 text-accent hover:text-primary-800 transition-colors"
                aria-label="Favoris"
              >
                <Icon name="heart" size="md" />
              </Link>
            )}

            {/* Cart */}
            <Link
              to="/checkout"
              className="relative p-2 text-accent hover:text-primary-800 transition-colors"
              aria-label="Panier"
            >
              <Icon name="cart" size="md" />
              {/* Cart count badge - will be connected to Redux later */}
              {/* <span className="absolute -top-1 -right-1 bg-primary-800 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                2
              </span> */}
            </Link>

            {/* User Menu / Auth Buttons */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  <Avatar
                    src={user?.avatarUrl}
                    alt={user?.username || 'User'}
                    fallback={user?.username}
                    size="sm"
                  />
                  <Icon name="chevron-down" size="xs" className="hidden md:block text-gray-500" />
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      role="button"
                      tabIndex={0}
                      onClick={() => setIsUserMenuOpen(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
                          setIsUserMenuOpen(false);
                        }
                      }}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50 animate-fade-in">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="font-medium text-accent">{user?.username}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>

                      <nav className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-accent hover:bg-gray-50"
                        >
                          <Icon name="user" size="sm" />
                          Mon profil
                        </Link>
                        <Link
                          to="/my-listings"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-accent hover:bg-gray-50"
                        >
                          <Icon name="tag" size="sm" />
                          Mes annonces
                        </Link>
                        <Link
                          to="/favorites"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-accent hover:bg-gray-50"
                        >
                          <Icon name="heart" size="sm" />
                          Favoris
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-accent hover:bg-gray-50"
                        >
                          <Icon name="settings" size="sm" />
                          Parametres
                        </Link>
                      </nav>

                      <div className="border-t border-gray-100 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-error-500 hover:bg-gray-50"
                        >
                          <Icon name="logout" size="sm" />
                          Deconnexion
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/login')}
                >
                  Connexion
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/register')}
                >
                  S'inscrire
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-accent"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={isMenuOpen}
            >
              <Icon name={isMenuOpen ? 'close' : 'menu'} size="md" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 py-4 animate-slide-down">
            {/* Mobile Search */}
            <div className="mb-4 md:hidden">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={handleSearch}
                placeholder="Rechercher..."
                fullWidth
              />
            </div>

            {/* Mobile Navigation */}
            <nav className="flex flex-col gap-1" aria-label="Navigation mobile">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className={clsx(
                    'px-3 py-3 rounded-md text-base font-medium transition-colors',
                    location.pathname === link.href
                      ? 'bg-primary-50 text-primary-800'
                      : 'text-accent hover:bg-gray-50'
                  )}
                >
                  {link.label}
                </Link>
              ))}

              {!isAuthenticated && (
                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-100">
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => navigate('/login')}
                  >
                    Connexion
                  </Button>
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => navigate('/register')}
                  >
                    S'inscrire
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
