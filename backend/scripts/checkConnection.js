const mongoose = require('mongoose');
require('dotenv').config();

async function checkConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conexão com MongoDB estabelecida com sucesso!');
    
    // Verificar coleções
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nColeções disponíveis:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });

    // Verificar índices
    console.log('\nÍndices:');
    for (const collection of collections) {
      const indexes = await mongoose.connection.db
        .collection(collection.name)
        .indexes();
      console.log(`\n${collection.name}:`);
      indexes.forEach(index => {
        console.log(`- ${JSON.stringify(index.key)}`);
      });
    }

  } catch (error) {
    console.error('Erro na conexão:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkConnection(); 