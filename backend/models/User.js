const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Email inválido']
  },
  password: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: [6, 'Senha deve ter no mínimo 6 caracteres']
  },
  phone: {
    type: String,
    required: [true, 'Telefone é obrigatório'],
    trim: true
  },
  role: {
    type: String,
    enum: ['passenger', 'driver', 'admin'],
    default: 'passenger'
  },
  vehicle: {
    model: String,
    plate: String,
    year: String,
    color: String
  },
  documents: {
    cnh: String,
    cpf: String
  },
  isApproved: {
    type: Boolean,
    default: function() {
      return this.role === 'passenger'; // Passageiros são aprovados automaticamente
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isAvailable: {
    type: Boolean,
    default: false
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
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema); 