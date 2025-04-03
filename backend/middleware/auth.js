const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Cache com tempo de expiração
const tokenCache = new Map();
const CACHE_DURATION = 3600000; // 1 hora em milissegundos
const LOG_INTERVAL = 300000; // 5 minutos em milissegundos
let lastLogTime = Date.now() - LOG_INTERVAL; // Permite primeiro log

const cleanExpiredCache = () => {
  const now = Date.now();
  for (const [token, data] of tokenCache.entries()) {
    if (now - data.timestamp > CACHE_DURATION) {
      tokenCache.delete(token);
    }
  }
};

// Limpa cache expirado a cada hora
setInterval(cleanExpiredCache, CACHE_DURATION);

const auth = async (req, res, next) => {
  try {
    // Rotas públicas que não precisam de autenticação
    const publicRoutes = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/driver-register', // Adicionar rota de registro de motorista como pública
      '/health'
    ];

    if (publicRoutes.includes(req.path)) {
      return next();
    }

    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    // Debug
    console.log('Token recebido:', token);
    console.log('Headers:', req.headers);

    if (!token) {
      console.log('Token não fornecido');
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decodificado:', decoded);

    const user = await User.findById(decoded.userId || decoded.id);
    if (!user) {
      console.log('Usuário não encontrado');
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(401).json({ message: 'Token inválido' });
  }
};

module.exports = auth; 