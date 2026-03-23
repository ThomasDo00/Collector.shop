import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { initializeAuth, selectAuthInitialized } from '@/features/auth/authSlice';
import Spinner from '@/components/atoms/Spinner';
import MainLayout from '@/components/templates/MainLayout';
import AuthLayout from '@/components/templates/AuthLayout';
import CheckoutLayout from '@/components/templates/CheckoutLayout';
import ProtectedRoute from '@/components/organisms/ProtectedRoute';

// Lazy loaded pages
const HomePage = lazy(() => import('@/pages/HomePage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const CatalogPage = lazy(() => import('@/pages/CatalogPage'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const CreateListingPage = lazy(() => import('@/pages/CreateListingPage').then(m => ({ default: m.CreateListingPage })));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const FavoritesPage = lazy(() => import('@/pages/FavoritesPage'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const MyListingsPage = lazy(() => import('@/pages/MyListingsPage'));

// Page loader component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

function App() {
  const dispatch = useAppDispatch();
  const isInitialized = useAppSelector(selectAuthInitialized);

  // Initialize auth on app load
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  // Show loader while initializing auth
  if (!isInitialized) {
    return <PageLoader />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes with MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/catalog/:category" element={<CatalogPage />} />
          <Route path="/search" element={<CatalogPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/cart" element={<CartPage />} />
        </Route>

        {/* Auth routes with AuthLayout */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* <Route path="/forgot-password" element={<ForgotPasswordPage />} /> */}
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/my-listings" element={<MyListingsPage />} />
            <Route path="/sell" element={<CreateListingPage />} />
          </Route>

          {/* Checkout has its own layout */}
          <Route element={<CheckoutLayout />}>
            <Route path="/checkout" element={<CheckoutPage />} />
          </Route>
        </Route>

        {/* 404 - Will be replaced with NotFoundPage later */}
        <Route path="*" element={
          <MainLayout />
        } />
      </Routes>
    </Suspense>
  );
}

export default App;
