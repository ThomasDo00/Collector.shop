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

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const isActive = (href: string) =>
    location.pathname === href || location.pathname.startsWith(href + '/');

  return (
    <header
      className={clsx(
        'sticky top-0 z-50 w-full transition-all duration-300',
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm'
          : 'bg-white border-b border-gray-100'
      )}
    >
      <div className="container-page">
        <div className="flex items-center h-16 md:h-20 gap-6">

          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo size="md" />
          </div>

          {/* ── Desktop Navigation + Search (left block) ── */}
          <div className="hidden lg:flex items-center gap-1 flex-1 min-w-0">

            {/* Nav links */}
            <nav className="flex items-center gap-1 mr-4 flex-shrink-0" aria-label="Navigation principale">
              <Link
                to="/catalog"
                className={clsx(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  isActive('/catalog') && location.pathname !== '/'
                    ? 'bg-primary-50 text-primary-800'
                    : 'text-gray-600 hover:text-primary-800 hover:bg-gray-50'
                )}
              >
                Catalogue
              </Link>

              <Link
                to="/catalog"
                className={clsx(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1',
                  'text-gray-600 hover:text-primary-800 hover:bg-gray-50'
                )}
              >
                Catégories
                <Icon name="chevron-down" size="xs" />
              </Link>

              <Link
                to={isAuthenticated ? '/sell' : '/login'}
                className={clsx(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1',
                  isActive('/sell')
                    ? 'bg-primary-50 text-primary-800'
                    : 'text-gray-600 hover:text-primary-800 hover:bg-gray-50'
                )}
              >
                <Icon name="plus" size="xs" />
                Vendre
              </Link>

              {isAuthenticated && (
                <Link
                  to="/my-listings"
                  className={clsx(
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1',
                    isActive('/my-listings')
                      ? 'bg-primary-50 text-primary-800'
                      : 'text-gray-600 hover:text-primary-800 hover:bg-gray-50'
                  )}
                >
                  <Icon name="tag" size="xs" />
                  Mes annonces
                </Link>
              )}
            </nav>

            {/* Search bar — takes remaining space */}
            <div className="flex-1 max-w-md">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={handleSearch}
                placeholder="Rechercher un article..."
                fullWidth
              />
            </div>
          </div>

          {/* Spacer mobile */}
          <div className="flex-1 lg:hidden" />

          {/* ── Right Actions ── */}
          <div className="flex items-center gap-1 flex-shrink-0">

            {/* Search icon — mobile only */}
            <button
              className="lg:hidden p-2 text-gray-500 hover:text-primary-800 transition-colors rounded-full hover:bg-gray-100"
              aria-label="Rechercher"
            >
              <Icon name="search" size="md" />
            </button>

            {isAuthenticated ? (
              <>
                {/* Favorites */}
                <Link
                  to="/favorites"
                  className={clsx(
                    'p-2 transition-colors rounded-full hover:bg-gray-100',
                    isActive('/favorites') ? 'text-primary-800' : 'text-gray-500 hover:text-primary-800'
                  )}
                  aria-label="Mes favoris"
                >
                  <Icon name="heart" size="md" />
                </Link>

                {/* Cart */}
                <Link
                  to="/cart"
                  className={clsx(
                    'p-2 transition-colors rounded-full hover:bg-gray-100',
                    isActive('/cart') ? 'text-primary-800' : 'text-gray-500 hover:text-primary-800'
                  )}
                  aria-label="Mon panier"
                >
                  <Icon name="cart" size="md" />
                </Link>

                {/* Avatar + Dropdown */}
                <div className="relative ml-1">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-gray-100 transition-colors"
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                    aria-label="Menu utilisateur"
                  >
                    <Avatar
                      src={user?.avatarUrl}
                      alt={user?.username || 'Utilisateur'}
                      fallback={user?.username}
                      size="sm"
                    />
                    <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[100px] truncate">
                      {user?.username}
                    </span>
                    <Icon name="chevron-down" size="xs" className="hidden md:block text-gray-400" />
                  </button>

                  {isUserMenuOpen && (
                    <>
                      <button
                        className="fixed inset-0 z-40 bg-transparent cursor-default"
                        onClick={() => setIsUserMenuOpen(false)}
                        aria-label="Fermer le menu"
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-fade-in">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="font-semibold text-gray-900 truncate">{user?.username}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>

                        <nav className="py-1">
                          <Link
                            to="/profile"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-800 transition-colors"
                          >
                            <Icon name="user" size="sm" />
                            Mon profil
                          </Link>
                          <Link
                            to="/my-listings"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-800 transition-colors"
                          >
                            <Icon name="tag" size="sm" />
                            Mes annonces
                          </Link>
                          <Link
                            to="/favorites"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-800 transition-colors"
                          >
                            <Icon name="heart" size="sm" />
                            Mes favoris
                          </Link>
                          <Link
                            to="/settings"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-800 transition-colors"
                          >
                            <Icon name="settings" size="sm" />
                            Paramètres
                          </Link>
                        </nav>

                        <div className="border-t border-gray-100 pt-1 mt-1">
                          <Link
                            to="/admin/products"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-orange-600 hover:bg-orange-50 transition-colors"
                          >
                            <Icon name="trash" size="sm" />
                            Admin — Supprimer produits
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Icon name="logout" size="sm" />
                            Déconnexion
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Cart */}
                <Link
                  to="/cart"
                  className="p-2 text-gray-500 hover:text-primary-800 transition-colors rounded-full hover:bg-gray-100"
                  aria-label="Panier"
                >
                  <Icon name="cart" size="md" />
                </Link>

                {/* Auth buttons - Desktop */}
                <div className="hidden md:flex items-center gap-2 ml-1">
                  <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                    Connexion
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
                    S'inscrire
                  </Button>
                </div>
              </>
            )}

            {/* Mobile burger */}
            <button
              className="lg:hidden p-2 text-gray-500 hover:text-primary-800 transition-colors rounded-full hover:bg-gray-100 ml-1"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={isMenuOpen}
            >
              <Icon name={isMenuOpen ? 'close' : 'menu'} size="md" />
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 pb-4 animate-slide-down">
            {/* Search */}
            <div className="pt-4 pb-3">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={handleSearch}
                placeholder="Rechercher..."
                fullWidth
              />
            </div>

            <nav className="flex flex-col" aria-label="Navigation mobile">
              <Link
                to="/catalog"
                className={clsx(
                  'flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors',
                  isActive('/catalog') ? 'bg-primary-50 text-primary-800' : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                Catalogue
              </Link>
              <Link
                to="/catalog"
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Catégories
              </Link>
              <Link
                to={isAuthenticated ? '/sell' : '/login'}
                className={clsx(
                  'flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors',
                  isActive('/sell') ? 'bg-primary-50 text-primary-800' : 'text-primary-800 hover:bg-primary-50'
                )}
              >
                <Icon name="plus" size="sm" />
                Vendre un article
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/my-listings"
                    className={clsx(
                      'flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors',
                      isActive('/my-listings') ? 'bg-primary-50 text-primary-800' : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <Icon name="tag" size="sm" />
                    Mes annonces
                  </Link>

                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <div className="px-3 py-2 flex items-center gap-3 mb-1">
                      <Avatar
                        src={user?.avatarUrl}
                        alt={user?.username || 'Utilisateur'}
                        fallback={user?.username}
                        size="sm"
                      />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{user?.username}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Icon name="user" size="sm" />
                      Mon profil
                    </Link>
                    <Link
                      to="/favorites"
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Icon name="heart" size="sm" />
                      Mes favoris
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Icon name="settings" size="sm" />
                      Paramètres
                    </Link>
                    <Link
                      to="/admin/products"
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-orange-600 hover:bg-orange-50 transition-colors"
                    >
                      <Icon name="trash" size="sm" />
                      Admin — Supprimer produits
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Icon name="logout" size="sm" />
                      Déconnexion
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-gray-100">
                  <Button variant="secondary" fullWidth onClick={() => navigate('/login')}>
                    Connexion
                  </Button>
                  <Button variant="primary" fullWidth onClick={() => navigate('/register')}>
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
