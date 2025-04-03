const Ride = require('../models/Ride');
const User = require('../models/User');
const Driver = require('../models/Driver');
const mongoose = require('mongoose');

exports.requestRide = async (req, res) => {
  try {
    const {
      origin,
      destination,
      paymentMethod,
      price,
      distance,
      duration
    } = req.body;

    const ride = new Ride({
      passenger: req.user.id,
      origin,
      destination,
      paymentMethod,
      price,
      distance,
      duration
    });

    await ride.save();

    // Buscar motoristas próximos
    const nearbyDrivers = await Driver.find({
      'status.isAvailable': true,
      'status.isApproved': true,
      location: {
        $near: {
          $geometry: origin.location,
          $maxDistance: 5000 // 5km
        }
      }
    }).populate('user');

    // Emitir evento para motoristas próximos
    // TODO: Implementar Socket.IO

    res.status(201).json({
      ride,
      nearbyDrivers: nearbyDrivers.length
    });
  } catch (error) {
    console.error('Erro ao solicitar corrida:', error);
    res.status(500).json({ message: 'Erro ao solicitar corrida' });
  }
};

exports.getNearbyDrivers = async (req, res) => {
  try {
    const { coordinates } = req.body;
    
    const drivers = await User.find({
      role: 'driver',
      isAvailable: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: coordinates
          },
          $maxDistance: 10000 // 10km em metros
        }
      }
    });

    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar motoristas próximos' });
  }
};

exports.acceptRide = async (req, res) => {
  try {
    const { id } = req.params;
    const { driverId } = req.body;

    console.log('Tentando aceitar corrida:', {
      rideId: id,
      driverId,
      body: req.body
    });

    const ride = await Ride.findById(id);
    
    if (!ride) {
      return res.status(404).json({ message: 'Corrida não encontrada' });
    }

    if (ride.status !== 'pending') {
      return res.status(400).json({ message: 'Corrida não está mais disponível' });
    }

    // Tratamento especial para o motorista mockado
    if (driverId === '507f1f77bcf86cd799439011') {
      ride.driver = driverId;
      ride.status = 'accepted';
      await ride.save();

      const mockDriver = {
        _id: driverId,
        name: 'João Motorista',
        rating: 4.8,
        vehicle: {
          model: 'Toyota Corolla',
          color: 'Prata',
          plate: 'ABC-1234'
        }
      };

      return res.json({
        ...ride.toObject(),
        driver: mockDriver
      });
    }

    // Caso não seja o motorista mockado, verificar disponibilidade
    const driver = await User.findById(driverId);
    if (!driver || !driver.isAvailable) {
      return res.status(400).json({ message: 'Motorista não está disponível' });
    }

    ride.driver = driverId;
    ride.status = 'accepted';
    await ride.save();

    res.json(ride);

  } catch (error) {
    console.error('Erro ao aceitar corrida:', error);
    res.status(500).json({ 
      message: 'Erro ao aceitar corrida',
      error: error.message 
    });
  }
};

exports.completeRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    console.log('Finalizando corrida:', rideId); // Debug

    const ride = await Ride.findById(rideId);
    if (!ride) {
      console.log('Corrida não encontrada:', rideId); // Debug
      return res.status(404).json({ message: 'Corrida não encontrada' });
    }

    // Log do estado atual
    console.log('Estado atual da corrida:', {
      status: ride.status,
      passenger: ride.passenger,
      driver: ride.driver,
      requestingUser: req.user.id
    });

    ride.status = 'completed';
    ride.endTime = new Date();
    await ride.save();

    res.json(ride);
  } catch (error) {
    console.error('Erro ao finalizar corrida:', error);
    res.status(500).json({ 
      message: 'Erro ao finalizar corrida',
      error: error.message 
    });
  }
};

exports.cancelRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Corrida não encontrada' });
    }

    ride.status = 'cancelled';
    await ride.save();

    // Aqui você pode implementar notificação às partes envolvidas

    res.json(ride);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao cancelar corrida' });
  }
};

exports.startRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({ message: 'Corrida não encontrada' });
    }

    ride.status = 'in_progress';
    ride.startTime = new Date();
    await ride.save();

    res.json(ride);
  } catch (error) {
    console.error('Erro ao iniciar corrida:', error);
    res.status(500).json({ message: 'Erro ao iniciar corrida' });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { location } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride || ride.driver.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Corrida não encontrada' });
    }

    // Atualiza localização do motorista
    await User.findByIdAndUpdate(req.user.id, {
      'location.coordinates': location.coordinates
    });

    res.json({ message: 'Localização atualizada' });
  } catch (error) {
    console.error('Erro ao atualizar localização:', error);
    res.status(500).json({ message: 'Erro ao atualizar localização' });
  }
};

exports.getRideStatus = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId)
      .populate('driver', 'name phone vehicle')
      .populate('passenger', 'name phone')
      .select('-__v');

    if (!ride) {
      return res.status(404).json({ message: 'Corrida não encontrada' });
    }

    res.json(ride);
  } catch (error) {
    console.error('Erro ao buscar status da corrida:', error);
    res.status(500).json({ message: 'Erro ao buscar status da corrida' });
  }
};

exports.getAvailableRides = async (req, res) => {
  try {
    // Verifica se é um motorista
    if (req.user.role !== 'driver') {
      return res.status(403).json({ message: 'Apenas motoristas podem buscar corridas' });
    }

    // Busca o motorista com localização atualizada
    const driver = await User.findById(req.user.id);
    
    console.log('\n=== DEBUG BUSCA DE CORRIDAS ===');
    console.log('1. Driver:', {
      id: driver._id,
      isAvailable: driver.isAvailable,
      location: driver.location
    });

    if (!driver.isAvailable) {
      console.log('2. Motorista não disponível');
      return res.json([]);
    }

    if (!driver.location || !driver.location.coordinates) {
      console.log('3. Sem localização do motorista');
      return res.status(400).json({ message: 'Localização do motorista não disponível' });
    }

    // Primeiro busca todas as corridas pendentes para debug
    const allPendingRides = await Ride.find({
      status: 'pending',
      driver: null
    });

    console.log('4. Total de corridas pendentes:', allPendingRides.length);
    
    if (allPendingRides.length > 0) {
      console.log('5. Exemplo de corrida pendente:', {
        id: allPendingRides[0]._id,
        origin: allPendingRides[0].origin,
        status: allPendingRides[0].status
      });
    }

    // Busca corridas pendentes próximas
    const query = {
      status: 'pending',
      driver: null,
      'origin.coordinates': {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: driver.location.coordinates
          },
          $maxDistance: 10000 // 10km em metros
        }
      }
    };

    console.log('6. Query de busca:', JSON.stringify(query, null, 2));

    const rides = await Ride.find(query)
      .populate('passenger', 'name phone')
      .limit(5);

    console.log('7. Corridas encontradas:', rides.length);
    console.log('=== FIM DEBUG ===\n');

    res.json(rides);
  } catch (error) {
    console.error('Erro ao buscar corridas:', error);
    res.status(500).json({ message: 'Erro ao buscar corridas' });
  }
};

exports.getCurrentRide = async (req, res) => {
  try {
    const ride = await Ride.findOne({
      $or: [
        { passenger: req.user.id },
        { driver: req.user.id }
      ],
      status: { 
        $in: ['pending', 'accepted', 'in_progress'] 
      }
    })
    .populate('passenger', 'name phone')
    .populate('driver', 'name phone vehicle')
    .sort('-createdAt'); // Pega a mais recente

    if (!ride) {
      return res.json(null);
    }

    res.json(ride);
  } catch (error) {
    console.error('Erro ao buscar corrida atual:', error);
    res.status(500).json({ message: 'Erro ao buscar corrida atual' });
  }
};

exports.finishRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({ message: 'Corrida não encontrada' });
    }

    ride.status = 'completed';
    ride.endTime = new Date();
    await ride.save();

    res.json(ride);
  } catch (error) {
    console.error('Erro ao finalizar corrida:', error);
    res.status(500).json({ message: 'Erro ao finalizar corrida' });
  }
};

exports.createRide = async (req, res) => {
  try {
    console.log('Criando corrida:', req.body); // Debug

    const { origin, destination, price } = req.body;

    // Validar dados
    if (!origin?.coordinates || !destination?.coordinates || !price) {
      return res.status(400).json({ 
        message: 'Dados inválidos',
        required: ['origin.coordinates', 'destination.coordinates', 'price']
      });
    }

    // Criar corrida
    const ride = new Ride({
      passenger: req.user.id,
      origin: {
        coordinates: origin.coordinates,
        address: origin.address
      },
      destination: {
        coordinates: destination.coordinates,
        address: destination.address
      },
      price,
      status: 'pending'
    });

    await ride.save();
    console.log('Corrida criada:', ride); // Debug

    res.status(201).json(ride);
  } catch (error) {
    console.error('Erro ao criar corrida:', error);
    res.status(500).json({ 
      message: 'Erro ao criar corrida',
      error: error.message 
    });
  }
};

exports.getRideHistory = async (req, res) => {
  try {
    const { role } = req.user;
    const { status, limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    // Construir query base
    const query = {
      [role === 'driver' ? 'driver' : 'passenger']: req.user.id
    };

    // Filtrar por status se fornecido
    if (status) {
      query.status = status;
    }

    // Buscar corridas com paginação
    const rides = await Ride.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('passenger', 'name')
      .populate('driver', 'name vehicle rating')
      .select('-__v');

    // Contar total para paginação
    const total = await Ride.countDocuments(query);

    res.json({
      rides,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        perPage: limit
      }
    });

  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ message: 'Erro ao buscar histórico' });
  }
};

exports.getRideDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const ride = await Ride.findById(id)
      .populate('passenger', 'name phone')
      .populate('driver', 'name phone vehicle rating')
      .populate({
        path: 'rating',
        select: 'stars comment tags'
      });

    if (!ride) {
      return res.status(404).json({ message: 'Corrida não encontrada' });
    }

    // Verificar se o usuário tem permissão para ver esta corrida
    if (ride.passenger._id.toString() !== req.user.id && 
        ride.driver?._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Sem permissão' });
    }

    res.json(ride);
  } catch (error) {
    console.error('Erro ao buscar detalhes da corrida:', error);
    res.status(500).json({ message: 'Erro ao buscar detalhes da corrida' });
  }
}; 