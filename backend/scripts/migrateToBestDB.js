const mongoose = require('mongoose');
require('dotenv').config();

async function migrateDatabase() {
  try {
    // Conectar ao banco antigo
    const oldUri = process.env.MONGODB_URI.replace('/best', '/bora');
    const oldConn = await mongoose.createConnection(oldUri);
    
    // Conectar ao novo banco
    const newConn = await mongoose.createConnection(process.env.MONGODB_URI);
    
    console.log('Iniciando migração...');

    // Migrar usuários
    const users = await oldConn.collection('users').find({}).toArray();
    if (users.length > 0) {
      await newConn.collection('users').insertMany(users);
      console.log(`${users.length} usuários migrados`);
    }

    // Migrar corridas
    const rides = await oldConn.collection('rides').find({}).toArray();
    if (rides.length > 0) {
      await newConn.collection('rides').insertMany(rides);
      console.log(`${rides.length} corridas migradas`);
    }

    // Migrar mensagens
    const messages = await oldConn.collection('messages').find({}).toArray();
    if (messages.length > 0) {
      await newConn.collection('messages').insertMany(messages);
      console.log(`${messages.length} mensagens migradas`);
    }

    console.log('Migração concluída com sucesso!');

  } catch (error) {
    console.error('Erro durante a migração:', error);
  } finally {
    await mongoose.disconnect();
  }
}

migrateDatabase(); 