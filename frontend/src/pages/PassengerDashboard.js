import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/images/logo.png';

export default function PassengerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message;
  const error = location.state?.error;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { text: 'Seus endereços', icon: '📍' },
    { text: 'Viagens', icon: '🕒' },
    { text: 'Avaliações', icon: '⭐' },
    { text: 'Pagamento', icon: '💳' },
    { text: 'Promoções', icon: '🎁' },
    { text: 'Ajuda', icon: '❓' }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">
            Bem-vindo, {user?.name || 'Passageiro'}
          </h1>

          {message && (
            <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <button
            onClick={() => navigate('/ride/request')}
            className="w-full bg-brand text-white py-3 rounded-lg hover:bg-brand-dark transition-colors duration-200"
          >
            Solicitar Nova Corrida
          </button>

          {/* Adicionar mais funcionalidades aqui */}
        </div>
      </div>

      {/* Header */}
      <header className="bg-brand p-4 flex justify-between items-center">
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="text-white p-2"
        >
          ☰
        </button>
        <img 
          src={logo} 
          alt="Move" 
          className="h-8 w-auto"
        />
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-300 rounded-full" />
        </div>
      </header>

      {/* Menu Lateral */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white">
            <div className="p-4">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gray-300 rounded-full" />
                <div>
                  <h3 className="font-medium">{user?.name}</h3>
                  <p className="text-sm text-gray-500">Ver perfil</p>
                </div>
              </div>

              <nav className="space-y-4">
                {menuItems.map((item, index) => (
                  <button 
                    key={index}
                    className="flex items-center space-x-3 w-full p-2 hover:bg-gray-100 rounded"
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.text}</span>
                  </button>
                ))}
              </nav>

              <button 
                onClick={handleLogout}
                className="mt-8 w-full p-2 text-left text-red-600 hover:bg-red-50 rounded"
              >
                Sair
              </button>
            </div>
          </div>
          <button 
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 w-full h-full cursor-default"
          />
        </div>
      )}
    </div>
  );
} 