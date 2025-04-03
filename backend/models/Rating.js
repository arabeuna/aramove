const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: true
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stars: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxLength: 500
  },
  tags: [{
    type: String,
    enum: [
      'pontual',
      'cordial', 
      'carro_limpo',
      'direção_segura',
      'profissional',
      'educado',
      'local_correto'
    ]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices
ratingSchema.index({ ride: 1 }, { unique: true });
ratingSchema.index({ from: 1, to: 1 });

module.exports = mongoose.model('Rating', ratingSchema); 