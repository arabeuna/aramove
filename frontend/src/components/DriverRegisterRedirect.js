import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DriverRegisterRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/driver-register', { replace: true });
  }, [navigate]);

  return <div>Redirecionando...</div>;
};

export default DriverRegisterRedirect; 