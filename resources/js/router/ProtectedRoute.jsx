import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ permission, children }) => {
  const { isAuthenticated, permissions } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (permission && !permissions.includes(permission)) {
    console.warn('ProtectedRoute blocked access:', {
        required: permission,
        has: permissions,
        isAuthenticated,
    });
    return <Navigate to="/403" replace />;
  }

  return children;
};

export default ProtectedRoute;
