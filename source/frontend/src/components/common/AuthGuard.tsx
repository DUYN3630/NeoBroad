import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface AuthGuardProps {
  allowedRoles?: number[];
}

const AuthGuard: React.FC<AuthGuardProps> = ({ allowedRoles }) => {
  const { accessToken, user } = useAuthStore();

  if (!accessToken || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If Admin tries to access student portal or vice versa, redirect to their home
    if (user.role === 0 || user.role === 1) {
      return <Navigate to="/" replace />;
    } else {
      return <Navigate to="/student/portal" replace />;
    }
  }

  return <Outlet />;
};

export default AuthGuard;
