const Driver = require('../models/Driver');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    console.log('Recebendo requisição de registro de motorista:', req.body);
    const { name, email, password, phone, vehicle, documents } = req.body;

    // Primeiro cria o usuário base
    const user = new User({
      name,
      email,
      password,
      phone
    });

    await user.save();

    // Cria o registro do motorista
    const driver = new Driver({
      user: user._id,
      vehicle,
      documents
    });

    await driver.save();

    // Gera o token
    const token = jwt.sign(
      { userId: user._id, driverId: driver._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        ...user.toObject(),
        driver: driver.toObject()
      }
    });

  } catch (error) {
    console.error('Erro no registro do motorista:', error);
    res.status(500).json({ message: 'Erro ao registrar motorista' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user.id }).populate('user');
    if (!driver) {
      return res.status(404).json({ message: 'Motorista não encontrado' });
    }
    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar perfil do motorista' });
  }
};

exports.getAvailableDrivers = async (req, res) => {
  try {
    console.log('Buscando motoristas disponíveis');
    
    // Retornar motorista mockado para teste
    const mockDriver = {
      _id: '507f1f77bcf86cd799439011', // ID fixo para o motorista mockado
      name: 'João Motorista',
      rating: 4.8,
      isAvailable: true,
      vehicle: {
        model: 'Toyota Corolla',
        color: 'Prata',
        plate: 'ABC-1234'
      },
      location: {
        lat: -23.550520,
        lng: -46.633308
      }
    };

    // Retornar array com motorista mockado
    res.json([mockDriver]);

  } catch (error) {
    console.error('Erro ao buscar motoristas:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar motoristas disponíveis',
      error: error.message 
    });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { isAvailable, isOnline } = req.body;
    
    const driver = await User.findById(req.user.id);
    if (!driver) {
      return res.status(404).json({ message: 'Motorista não encontrado' });
    }

    // Atualizar status
    if (typeof isAvailable === 'boolean') {
      driver.isAvailable = isAvailable;
    }
    if (typeof isOnline === 'boolean') {
      driver.isOnline = isOnline;
    }

    await driver.save();

    res.json({ 
      message: 'Status atualizado com sucesso',
      driver: {
        isAvailable: driver.isAvailable,
        isOnline: driver.isOnline
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ message: 'Erro ao atualizar status' });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    // Para o motorista mockado, simular atualização
    if (req.user.id === '507f1f77bcf86cd799439011') {
      return res.json({
        location: {
          lat: latitude,
          lng: longitude
        }
      });
    }

    const driver = await User.findById(req.user.id);
    if (!driver) {
      return res.status(404).json({ message: 'Motorista não encontrado' });
    }

    driver.location = {
      type: 'Point',
      coordinates: [longitude, latitude]
    };
    await driver.save();

    res.json({
      location: {
        lat: latitude,
        lng: longitude
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar localização:', error);
    res.status(500).json({ message: 'Erro ao atualizar localização' });
  }
};

// Adicionar método para buscar localização atual do motorista
exports.getDriverLocation = async (req, res) => {
  try {
    const { driverId } = req.params;

    // Para o motorista mockado, retornar localização simulada
    if (driverId === '507f1f77bcf86cd799439011') {
      return res.json({
        location: {
          lat: -23.550520 + (Math.random() - 0.5) * 0.01, // Simular movimento
          lng: -46.633308 + (Math.random() - 0.5) * 0.01
        }
      });
    }

    const driver = await User.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: 'Motorista não encontrado' });
    }

    res.json({
      location: {
        lat: driver.location.coordinates[1],
        lng: driver.location.coordinates[0]
      }
    });
  } catch (error) {
    console.error('Erro ao buscar localização:', error);
    res.status(500).json({ message: 'Erro ao buscar localização' });
  }
}; 