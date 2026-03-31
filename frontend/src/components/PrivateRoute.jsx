import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { LoadingSpinner } from './LoadingSpinner';

export function PrivateRoute({ children, requiredRole = null }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasRequiredRole, setHasRequiredRole] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      setIsAuthenticated(true);
      
      if (requiredRole) {
        const userData = JSON.parse(user);
        setHasRequiredRole(userData.role === requiredRole);
      }
    }

    setLoading(false);
  }, [requiredRole]);

  if (loading) {
    return <LoadingSpinner message="Verifying access..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasRequiredRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
