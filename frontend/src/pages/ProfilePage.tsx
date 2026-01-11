import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Typography from '@/components/atoms/Typography';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Avatar from '@/components/atoms/Avatar';
import Icon from '@/components/atoms/Icon';
import Rating from '@/components/molecules/Rating';
import ProductGrid from '@/components/organisms/ProductGrid';
import { useAppSelector } from '@/store';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { userService, type UserProfile, type Review } from '@/services/user.service';
import type { ProductPreview } from '@/types';

type TabType = 'listings' | 'reviews' | 'about';

/**
 * User profile page
 */
function ProfilePage() {
  const { username: usernameParam } = useParams<{ username?: string }>();
  const currentUser = useAppSelector(selectCurrentUser);
  const [activeTab, setActiveTab] = useState<TabType>('listings');
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [listings, setListings] = useState<ProductPreview[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Determine which username to use (from URL or current user)
  const username = usernameParam || currentUser?.username || 'vintage_collector';
  const isOwnProfile = !usernameParam || usernameParam === currentUser?.username;

  // Load user profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const [profileData, listingsData, reviewsData] = await Promise.all([
          userService.getProfile(username),
          userService.getListings(username),
          userService.getReviews(username),
        ]);
        setUser(profileData);
        setListings(listingsData);
        setReviews(reviewsData);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [username]);

  const filteredListings = showActiveOnly
    ? listings.filter((p) => p.status === 'active')
    : listings;

  const tabs: { id: TabType; label: string; count?: number }[] = [
    { id: 'listings', label: 'Articles', count: listings.length },
    { id: 'reviews', label: 'Avis', count: reviews.length },
    { id: 'about', label: 'A propos' },
  ];

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Typography variant="body" className="text-gray-500">
          Chargement du profil...
        </Typography>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-primary-800 text-white">
        <div className="container-page py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <Avatar
              src={user.avatarUrl}
              alt={user.username}
              size="xl"
              className="ring-4 ring-white/20"
            />

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Typography variant="h2" className="text-white">
                  @{user.username}
                </Typography>
                {user.isVerified && (
                  <Badge variant="success" className="bg-white/20 text-white">
                    <Icon name="check" size="xs" className="mr-1" />
                    Verifie
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm mb-4">
                <span className="flex items-center gap-1">
                  <Icon name="map" size="sm" />
                  {user.location}
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="calendar" size="sm" />
                  Membre depuis {new Date(user.memberSince).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </span>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6">
                <div>
                  <div className="flex items-center gap-1">
                    <Rating value={user.rating} size="sm" readonly className="text-warning-400" />
                    <span className="font-semibold">{user.rating}</span>
                  </div>
                  <p className="text-sm text-white/70">{user.reviewCount} avis</p>
                </div>
                <div>
                  <p className="font-semibold">{user.salesCount}</p>
                  <p className="text-sm text-white/70">ventes</p>
                </div>
                <div>
                  <p className="font-semibold">{user.responseRate}%</p>
                  <p className="text-sm text-white/70">taux de reponse</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {isOwnProfile ? (
                <Button
                  variant="secondary"
                  leftIcon={<Icon name="settings" size="sm" />}
                  onClick={() => {/* Navigate to settings */}}
                >
                  Modifier le profil
                </Button>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    leftIcon={<Icon name="chat" size="sm" />}
                  >
                    Contacter
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-white border-white/30 hover:bg-white/10"
                  >
                    <Icon name="user-plus" size="sm" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-[73px] z-10">
        <div className="container-page">
          <div className="flex gap-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-primary-800 text-primary-800'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-2 text-gray-400">({tab.count})</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container-page py-8">
        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div>
            {/* Filter */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {filteredListings.length} article{filteredListings.length === 1 ? '' : 's'}
              </p>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showActiveOnly}
                  onChange={(e) => setShowActiveOnly(e.target.checked)}
                  className="w-4 h-4 text-primary-800 rounded focus:ring-primary-800"
                />
                <span className="text-sm text-gray-600">Afficher uniquement les articles disponibles</span>
              </label>
            </div>

            <ProductGrid
              products={filteredListings}
              columns={4}
              emptyMessage={isOwnProfile ? 'Vous n\'avez pas encore d\'articles en vente' : 'Ce vendeur n\'a pas d\'articles en vente'}
            />

            {isOwnProfile && (
              <div className="text-center mt-8">
                <Link to="/sell">
                  <Button variant="primary" leftIcon={<Icon name="plus" size="sm" />}>
                    Ajouter un article
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="max-w-3xl">
            {/* Rating Summary */}
            <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <p className="text-5xl font-bold text-accent">{user.rating}</p>
                  <Rating value={user.rating} size="md" readonly className="mt-2" />
                  <p className="text-sm text-gray-500 mt-1">{user.reviewCount} avis</p>
                </div>
                <div className="flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map(stars => {
                    const count = reviews.filter((r) => r.rating === stars).length;
                    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={stars} className="flex items-center gap-3">
                        <span className="text-sm w-4">{stars}</span>
                        <Icon name="star-solid" size="xs" className="text-warning-500" />
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-warning-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-500 w-8">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
              {reviews.length === 0 ? (
                <div className="text-center py-12">
                  <Typography variant="body" className="text-gray-500">
                    Aucun avis pour le moment
                  </Typography>
                </div>
              ) : (
                reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <Avatar
                      src={review.author.avatarUrl ?? undefined}
                      alt={review.author.username}
                      size="md"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">@{review.author.username}</p>
                          <Rating value={review.rating} size="sm" readonly className="mt-1" />
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <p className="mt-3 text-gray-600">{review.comment}</p>
                    </div>
                  </div>
                </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="max-w-3xl">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              {/* Bio */}
              <div className="mb-8">
                <Typography variant="h4" className="mb-4">Bio</Typography>
                <p className="text-gray-600 whitespace-pre-line">
                  {user.bio || 'Aucune description fournie.'}
                </p>
              </div>

              {/* Stats */}
              <div className="mb-8">
                <Typography variant="h4" className="mb-4">Statistiques</Typography>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-primary-800">{user.salesCount}</p>
                    <p className="text-sm text-gray-500">Ventes</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-primary-800">{user.responseRate}%</p>
                    <p className="text-sm text-gray-500">Taux de reponse</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-primary-800">{user.responseTime}</p>
                    <p className="text-sm text-gray-500">Temps de reponse</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
