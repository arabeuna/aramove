const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB Conectado: ${conn.connection.host}`);
    
    // Verificar se as coleções existem
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Coleções disponíveis:', collections.map(c => c.name));
    
  } catch (error) {
    console.error('Erro na conexão com MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB; 