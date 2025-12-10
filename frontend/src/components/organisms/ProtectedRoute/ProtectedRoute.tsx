import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store';
import {
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthInitialized,
  selectUserRole,
} from '@/features/auth/authSlice';
import Spinner from '@/components/atoms/Spinner';
import type { UserRole } from '@/types';

export interface ProtectedRouteProps {
  /** Required role to access the route */
  requiredRole?: UserRole | UserRole[];
  /** Redirect path if not authenticated */
  redirectTo?: string;
}

/**
 * Protected route wrapper that requires authentication
 */
function ProtectedRoute({
  requiredRole,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);
  const isInitialized = useAppSelector(selectAuthInitialized);
  const userRole = useAppSelector(selectUserRole);

  // Show loading while checking auth
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role if required
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

    // Admin has access to everything
    if (userRole !== 'admin' && !allowedRoles.includes(userRole as UserRole)) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}

export default ProtectedRoute;
