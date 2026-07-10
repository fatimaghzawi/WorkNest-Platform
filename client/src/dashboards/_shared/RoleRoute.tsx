import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { LoaderOverlay } from '../../components/common/Loader';
import { getDashboardPath, useAuth } from '../../hooks/useAuth';
import type { UserRole } from '../../types/auth';

export function createRoleRoute(allowedRole: UserRole) {
  return function RoleRoute() {
    const { user, isLoading, isAuthenticated } = useAuth();
    const location = useLocation();

    if (isLoading) {
      return <LoaderOverlay fullscreen label="Checking session..." />;
    }

    if (!isAuthenticated) {
      return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    if (user?.role !== allowedRole) {
      return <Navigate to={getDashboardPath(user.role)} replace />;
    }

    return <Outlet />;
  };
}
