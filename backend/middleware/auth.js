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
    // Melhorar a detecção do token
    const token = req.header('Authorization')?.split(' ')[1] || 
                 req.query.token || 
                 req.cookies?.token;

    if (!token) {
      console.log('Token não fornecido');
      return res.status(401).json({ 
        error: 'Autenticação necessária',
        details: 'Token não fornecido'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id || decoded.userId);

      if (!user) {
        return res.status(401).json({ 
          error: 'Usuário não encontrado' 
        });
      }

      req.user = user;
      req.token = token;
      next();
    } catch (err) {
      console.error('Erro na verificação do token:', err);
      return res.status(401).json({ 
        error: 'Token inválido',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = auth; 