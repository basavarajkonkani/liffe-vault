import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('owner' | 'nominee' | 'admin')[];
}

/**
 * ProtectedRoute component that guards authenticated routes
 * Redirects to login if user is not authenticated
 * Optionally checks if user has required role
 */
const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // Check if user is authenticated
  if (!isAuthenticated || !user) {
    // Redirect to login page, saving the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role (if specified)
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      // User doesn't have required role - redirect to their dashboard
      switch (user.role) {
        case 'owner':
          return <Navigate to="/dashboard/owner" replace />;
        case 'nominee':
          return <Navigate to="/dashboard/nominee" replace />;
        case 'admin':
          return <Navigate to="/dashboard/admin" replace />;
        default:
          return <Navigate to="/dashboard" replace />;
      }
    }
  }

  // User is authenticated and has required role (if specified)
  return <>{children}</>;
};

export default ProtectedRoute;
