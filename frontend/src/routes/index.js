import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DriverRegister from '../pages/DriverRegister';
import PendingApprovalPage from '../pages/PendingApprovalPage';
import RequestRide from '../pages/RequestRide';
import PassengerDashboard from '../pages/PassengerDashboard';
import PrivateRoute from './PrivateRoute';
import WaitingDriver from '../pages/WaitingDriver';
import RideComplete from '../pages/RideComplete';
import RideHistory from '../pages/RideHistory';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/driver-register" element={<DriverRegister />} />

      {/* Rotas protegidas */}
      <Route path="/" element={<PrivateRoute><PassengerDashboard /></PrivateRoute>} />
      <Route path="/driver/pending" element={<PrivateRoute><PendingApprovalPage /></PrivateRoute>} />
      <Route path="/ride/request" element={<PrivateRoute><RequestRide /></PrivateRoute>} />
      <Route
        path="/ride/waiting"
        element={
          <PrivateRoute>
            <WaitingDriver />
          </PrivateRoute>
        }
      />
      <Route 
        path="/ride/:rideId/complete" 
        element={
          <PrivateRoute>
            <RideComplete />
          </PrivateRoute>
        } 
      />

      <Route 
        path="/passenger/dashboard" 
        element={
          <PrivateRoute>
            <PassengerDashboard />
          </PrivateRoute>
        } 
      />

      <Route 
        path="/" 
        element={
          <PrivateRoute>
            <Navigate to="/passenger/dashboard" replace />
          </PrivateRoute>
        } 
      />

      <Route 
        path="/rides/history" 
        element={
          <PrivateRoute>
            <RideHistory />
          </PrivateRoute>
        } 
      />
    </Routes>
  );
};

export default AppRoutes; 