const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  requestRide,
  getAvailableRides,
  acceptRide,
  startRide,
  completeRide,
  cancelRide,
  getCurrentRide,
  getRideStatus,
  updateLocation,
  createRide,
  getRideHistory,
  getRideDetails
} = require('../controllers/rideController');
const Ride = require('../models/Ride');

// Todas as rotas precisam de autenticação
router.use(auth);

// Rotas para passageiros
router.post('/request', requestRide);
router.get('/current', getCurrentRide);

// Rotas para motoristas
router.get('/available', getAvailableRides);
router.put('/:id/accept', acceptRide);
router.post('/:rideId/start', startRide);
router.post('/:rideId/complete', completeRide);
router.post('/:rideId/location', updateLocation);

// Rotas comuns
router.post('/:rideId/cancel', cancelRide);
router.get('/:rideId/status', getRideStatus);

router.post('/', createRide);

// Rota para buscar uma corrida específica
router.get('/:rideId', auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId)
      .populate('passenger', 'name')
      .populate('driver', 'name');

    if (!ride) {
      return res.status(404).json({ message: 'Corrida não encontrada' });
    }

    // Verifica se o usuário tem permissão para ver esta corrida
    if (ride.passenger._id.toString() !== req.user.id && 
        (!ride.driver || ride.driver._id.toString() !== req.user.id)) {
      return res.status(403).json({ message: 'Sem permissão para ver esta corrida' });
    }

    res.json(ride);
  } catch (error) {
    console.error('Erro ao buscar corrida:', error);
    res.status(500).json({ message: 'Erro ao buscar corrida' });
  }
});

// Rota para buscar o status de uma corrida
router.get('/status/:rideId', auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId)
      .populate('passenger', 'name')
      .populate('driver', 'name')
      .select('status origin destination driver passenger createdAt');

    if (!ride) {
      return res.status(404).json({ message: 'Corrida não encontrada' });
    }

    // Verifica se o usuário tem permissão para ver esta corrida
    if (ride.passenger._id.toString() !== req.user.id && 
        (!ride.driver || ride.driver._id.toString() !== req.user.id)) {
      return res.status(403).json({ message: 'Sem permissão para ver esta corrida' });
    }

    res.json(ride);
  } catch (error) {
    console.error('Erro ao buscar status da corrida:', error);
    res.status(500).json({ message: 'Erro ao buscar status da corrida' });
  }
});

router.post('/:rideId/complete', auth, async (req, res) => {
  try {
    const { rideId } = req.params;
    
    // Debug
    console.log('User:', req.user);
    console.log('RideId:', rideId);
    
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Corrida não encontrada' });
    }

    // Verificar se o usuário é o motorista ou passageiro da corrida
    if (ride.driver?.toString() !== req.user.id && 
        ride.passenger?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Não autorizado' });
    }

    ride.status = 'completed';
    ride.endTime = new Date();
    await ride.save();

    res.json(ride);
  } catch (error) {
    console.error('Erro ao finalizar corrida:', error);
    res.status(500).json({ message: 'Erro ao finalizar corrida' });
  }
});

router.get('/history', getRideHistory);
router.get('/:id', getRideDetails);

module.exports = router; 