import React, { useEffect } from 'react';

const DriverDashboard = () => {
  useEffect(() => {
    console.log('Driver Dashboard mounting...');
    try {
      // Log the initial state
      console.log('Initial state:', {
        isLoading,
        currentLocation,
        isOnline
      });
      
      // ... resto do código existente ...
      
    } catch (error) {
      console.error('Error in Driver Dashboard:', error);
    }
  }, []);

  return (
    // Rest of the component code
  );
};

export default DriverDashboard; 