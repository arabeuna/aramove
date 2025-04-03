import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMessages } from '../contexts/MessageContext';
import logoFull from '../assets/images/logo-full.png';
import logo from '../assets/images/logo.png';
import api from '../services/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);
  const { unreadMessages } = useMessages();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      // Primeiro limpar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Limpar headers do Axios
      delete api.defaults.headers.common['Authorization'];
      
      // Executar logout do AuthContext
      await logout();
      
      // Limpar estados locais
      setIsMenuOpen(false);
      setIsHelpMenuOpen(false);
      
      // Forçar redirecionamento e reload
      window.location.href = '/login';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Em caso de erro, forçar limpeza
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  return (
    <nav className="bg-brand shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <img className="h-8" src={logo} alt="Logo" />
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-white">
                  Olá, {user.name || user.email}
                </span>
                
                {user.role === 'driver' && (
                  <Link
                    to="/driver-dashboard"
                    className="text-white hover:text-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Dashboard
                  </Link>
                )}
                
                {user.role === 'user' && (
                  <Link
                    to="/request-ride"
                    className="text-purple-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Solicitar Corrida
                  </Link>
                )}
                
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="text-purple-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Admin
                  </Link>
                )}

                {/* Menu de Ajuda */}
                <div className="relative">
                  <button 
                    onClick={() => setIsHelpMenuOpen(!isHelpMenuOpen)}
                    className="text-purple-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
                    onMouseEnter={() => setIsHelpMenuOpen(true)}
                    onMouseLeave={() => setIsHelpMenuOpen(false)}
                  >
                    <span>Ajuda</span>
                    {unreadMessages && (
                      <span className="ml-1 h-2 w-2 bg-red-500 rounded-full"></span>
                    )}
                  </button>

                  {isHelpMenuOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                      onMouseEnter={() => setIsHelpMenuOpen(true)}
                      onMouseLeave={() => setIsHelpMenuOpen(false)}
                    >
                      <div className="py-1">
                        <Link
                          to={user.role === 'admin' ? "/admin/support" : "/help/support"}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50"
                        >
                          {user.role === 'admin' ? 'Central de Suporte' : 'Falar com Suporte'}
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handleLogout}
                  className="text-white hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 mr-1" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-purple-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Cadastrar
                </Link>
                <Link
                  to="/driver-register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  Seja um Motorista
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 