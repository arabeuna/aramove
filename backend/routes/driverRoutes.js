const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const auth = require('../middleware/auth');

// Log para debug
router.use((req, res, next) => {
  console.log('Rota de motorista acessada:', {
    method: req.method,
    path: req.path,
    body: req.body,
    user: req.user?.id
  });
  next();
});

// Rotas públicas
router.post('/register', driverController.register);

// Rotas protegidas
router.get('/available', auth, driverController.getAvailableDrivers);
router.get('/profile', auth, driverController.getProfile);
router.put('/status', auth, driverController.updateStatus);

module.exports = router; 