const User = require('../models/User');
const mongoose = require('mongoose');
require('dotenv').config();

async function seedDrivers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Criar alguns motoristas de teste
    const drivers = [
      {
        name: 'João Motorista',
        email: 'joao.motorista@move.com',
        password: '123456',
        phone: '11999999999',
        role: 'driver',
        isAvailable: true,
        isApproved: true,
        isOnline: true,
        rating: 4.8,
        vehicle: {
          model: 'Toyota Corolla',
          color: 'Prata',
          plate: 'ABC-1234'
        },
        location: {
          type: 'Point',
          coordinates: [-46.6333, -23.5505]
        }
      },
      {
        name: 'Maria Motorista',
        email: 'maria.motorista@move.com',
        password: '123456',
        phone: '11988888888',
        role: 'driver',
        isAvailable: true,
        isApproved: true,
        isOnline: true,
        rating: 4.9,
        vehicle: {
          model: 'Honda Civic',
          color: 'Preto',
          plate: 'XYZ-5678'
        },
        location: {
          type: 'Point',
          coordinates: [-46.6433, -23.5605]
        }
      }
    ];

    // Limpar motoristas existentes
    await User.deleteMany({ role: 'driver' });

    // Inserir novos motoristas
    for (const driverData of drivers) {
      const driver = new User(driverData);
      await driver.save();
      console.log('Motorista criado:', driver.name);
    }

    console.log('Motoristas de teste criados com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  }
}

seedDrivers(); 