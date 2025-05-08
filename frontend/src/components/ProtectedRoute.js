import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

// Protected route component for authenticated users
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const location = useLocation();
  const isLoggedIn = authService.isLoggedIn();
  const isAdmin = authService.isAdmin();

  if (!isLoggedIn) {
    // Redirect to login if not logged in
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    // Redirect to home if not admin but admin access is required
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute; 