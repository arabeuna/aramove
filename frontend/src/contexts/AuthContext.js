import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configurar token no Axios quando ele mudar
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  // Carregar dados do usuário e token ao iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    
    setLoading(false);
  }, []);

  const register = async (data) => {
    try {
      const response = await api.post('/auth/register', data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
      }

      return response.data;
    } catch (error) {
      console.error('Erro no registro:', error.response?.data || error.message);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.token) {
        const { token, user } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        setToken(token);
        setUser(user);
      }

      return response.data;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  };

  const logout = useCallback(() => {
    try {
      // Limpar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Resetar estados
      setUser(null);
      setToken(null);
      
      // Limpar headers do Axios
      delete api.defaults.headers.common['Authorization'];
      
      // Forçar limpeza de interceptors
      api.interceptors.request.handlers = [];
      api.interceptors.response.handlers = [];
      
      console.log('Logout realizado com sucesso');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  }, []);

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 