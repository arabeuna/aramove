const Rating = require('../models/Rating');
const Ride = require('../models/Ride');
const User = require('../models/User');

exports.createRating = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { stars, comment, tags } = req.body;

    // Buscar corrida
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Corrida não encontrada' });
    }

    // Verificar se usuário participou da corrida
    const isDriver = ride.driver.toString() === req.user.id;
    const isPassenger = ride.passenger.toString() === req.user.id;
    
    if (!isDriver && !isPassenger) {
      return res.status(403).json({ message: 'Não autorizado' });
    }

    // Verificar se já avaliou
    const existingRating = await Rating.findOne({ ride: rideId, from: req.user.id });
    if (existingRating) {
      return res.status(400).json({ message: 'Corrida já avaliada' });
    }

    // Criar avaliação
    const rating = new Rating({
      ride: rideId,
      from: req.user.id,
      to: isDriver ? ride.passenger : ride.driver,
      stars,
      comment,
      tags
    });

    await rating.save();

    // Atualizar média de avaliações do usuário avaliado
    const userRatings = await Rating.find({ to: rating.to });
    const averageRating = userRatings.reduce((acc, curr) => acc + curr.stars, 0) / userRatings.length;

    await User.findByIdAndUpdate(rating.to, { 
      $set: { rating: averageRating }
    });

    res.status(201).json(rating);
  } catch (error) {
    console.error('Erro ao criar avaliação:', error);
    res.status(500).json({ message: 'Erro ao criar avaliação' });
  }
}; 