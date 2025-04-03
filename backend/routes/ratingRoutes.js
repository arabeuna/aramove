const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ratingController = require('../controllers/ratingController');

router.post('/rides/:rideId/rate', auth, ratingController.createRating);

module.exports = router; 