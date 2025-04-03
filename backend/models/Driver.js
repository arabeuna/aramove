const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicle: {
    model: {
      type: String,
      required: true
    },
    plate: {
      type: String,
      required: true,
      unique: true
    },
    year: {
      type: String,
      required: true
    },
    color: {
      type: String,
      required: true
    }
  },
  documents: {
    cnh: {
      type: String,
      required: true
    },
    cpf: {
      type: String,
      required: true,
      unique: true
    }
  },
  status: {
    isApproved: {
      type: Boolean,
      default: false
    },
    isAvailable: {
      type: Boolean,
      default: false
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  }
}, {
  timestamps: true
});

// Índices
driverSchema.index({ location: '2dsphere' });
driverSchema.index({ 'documents.cpf': 1 }, { unique: true });
driverSchema.index({ 'vehicle.plate': 1 }, { unique: true });

const Driver = mongoose.model('Driver', driverSchema);
module.exports = Driver; 