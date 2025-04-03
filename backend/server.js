const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();
const security = require('./middleware/security');
const cookieConfig = require('./middleware/cookieConfig');

const app = express();

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://apis.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://apis.google.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: [
        "'self'",
        "https://accounts.google.com",
        "https://drive.google.com"
      ],
      frameAncestors: ["'self'"],
      sandbox: ['allow-same-origin', 'allow-scripts', 'allow-forms', 'allow-popups']
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Configuração mais detalhada do CORS
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(compression());
app.use(express.json());

// Aplicar middlewares
app.use(security);
app.use(cookieConfig);

// Adicionar middleware para logging de requisições
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    body: req.body,
    query: req.query,
    headers: req.headers
  });
  next();
});

// Conexão com MongoDB com retry
const connectDB = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log('MongoDB Conectado...');
      return;
    } catch (err) {
      console.error(`Tentativa ${i + 1} de ${retries} falhou:`, err.message);
      if (i === retries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

connectDB().catch(err => {
  console.error('Erro fatal na conexão com MongoDB:', err);
  process.exit(1);
});

// Rotas
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/rides', require('./routes/rideRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/drivers', require('./routes/driverRoutes'));
app.use('/api/ratings', require('./routes/ratingRoutes'));

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    dbConnection: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} em modo ${process.env.NODE_ENV}`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido. Iniciando shutdown graceful...');
  server.close(() => {
    console.log('Servidor HTTP fechado.');
    mongoose.connection.close(false, () => {
      console.log('Conexão MongoDB fechada.');
      process.exit(0);
    });
  });
});

module.exports = app; 