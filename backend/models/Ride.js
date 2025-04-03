const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  passenger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.status === 'accepted' || this.status === 'in_progress' || this.status === 'completed';
    }
  },
  origin: {
    type: {
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      },
      address: {
        type: String,
        required: true
      }
    },
    required: true
  },
  destination: {
    type: {
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      },
      address: {
        type: String,
        required: true
      }
    },
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  price: {
    type: Number,
    required: true
  },
  distance: Number,
  duration: Number,
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'pix']
  },
  startTime: Date,
  endTime: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices
rideSchema.index({ 'origin.location': '2dsphere' });
rideSchema.index({ 'destination.location': '2dsphere' });
rideSchema.index({ status: 1 });
rideSchema.index({ driver: 1, status: 1 });
rideSchema.index({ passenger: 1, status: 1 });

// Middleware para validar o driver
rideSchema.pre('save', function(next) {
  if (this.status === 'accepted' && !this.driver) {
    next(new Error('Driver is required when status is accepted'));
  }
  next();
});

const Ride = mongoose.model('Ride', rideSchema);
module.exports = Ride; 