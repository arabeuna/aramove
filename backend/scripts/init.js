const mongoose = require('mongoose');
require('dotenv').config();

async function initializeDatabase() {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado ao MongoDB com sucesso!');

    // Criar índices necessários
    const collections = ['users', 'rides', 'messages'];
    
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection).countDocuments();
      console.log(`Coleção ${collection}: ${count} documentos`);
    }

    console.log('\nBanco de dados inicializado com sucesso!');

  } catch (error) {
    console.error('Erro na inicialização:', error);
  } finally {
    await mongoose.disconnect();
  }
}

initializeDatabase(); 