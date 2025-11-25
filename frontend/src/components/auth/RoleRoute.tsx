import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import ProtectedRoute from './ProtectedRoute';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: ('owner' | 'nominee' | 'admin')[];
}

/**
 * RoleRoute component that checks user role
 * Wraps ProtectedRoute and adds role-based access control
 */
const RoleRoute = ({ children, allowedRoles }: RoleRouteProps) => {
  const { user } = useAuthStore();

  return (
    <ProtectedRoute>
      {user && allowedRoles.includes(user.role) ? (
        <>{children}</>
      ) : (
        <Navigate to="/dashboard" replace />
      )}
    </ProtectedRoute>
  );
};

export default RoleRoute;
