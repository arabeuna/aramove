const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB Conectado: ${conn.connection.host}`);
    
    // Adicionar listeners para eventos de conexão
    mongoose.connection.on('error', err => {
      console.error('Erro na conexão MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB desconectado');
    });

    return conn;
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB; 