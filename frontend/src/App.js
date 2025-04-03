import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes/index';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <ErrorBoundary>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <AppRoutes />
          </div>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
} 