import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, Role } from './AuthContext';
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}
export function ProtectedRoute({
  children,
  allowedRoles
}: ProtectedRouteProps) {
  const { user, isAuthenticated, loading, refreshSubscription } = useAuth();
  React.useEffect(() => {
    if (isAuthenticated) {
      void refreshSubscription();
    }
  }, [isAuthenticated, refreshSubscription]);
  if (loading) {
    return <div className="p-6 text-slate-600">Checking session...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }
  if (user && !allowedRoles.includes(user.role)) {
    return (
      <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />);

  }
  return <>{children}</>;
}