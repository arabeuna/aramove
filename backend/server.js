const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Conexão com MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Conectado...'))
  .catch(err => {
    console.error('Erro na conexão com MongoDB:', err);
    process.exit(1);
  });

// Rotas
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/rides', require('./routes/rideRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

// Rota de teste/health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    dbConnection: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app; 