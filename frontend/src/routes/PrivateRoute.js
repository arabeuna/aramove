import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    console.log('Estado de autenticação:', isAuthenticated);
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    // Redireciona para login mantendo a URL original como state
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute; 