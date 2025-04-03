import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'  // Já inclui /api
});

// Adicionar token em todas as requisições
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Token enviado:', token);
  } else {
    console.warn('Token não encontrado no localStorage');
  }
  
  return config;
}, error => {
  return Promise.reject(error);
});

// Tratamento de erros
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Apenas redirecionar se não estiver em uma rota de autenticação
      const authRoutes = ['/login', '/register', '/driver-register'];
      if (!authRoutes.some(route => window.location.pathname.includes(route))) {
        console.log('Token inválido, redirecionando para login');
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    console.error('Erro na requisição:', error);
    return Promise.reject(error);
  }
);

export const clearApiToken = () => {
  delete api.defaults.headers.common['Authorization'];
};

export default api; 