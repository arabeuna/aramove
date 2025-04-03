const { check } = require('express-validator');

const driverRegisterValidation = [
  check('name').notEmpty().withMessage('Nome é obrigatório'),
  check('email').isEmail().withMessage('Email inválido'),
  check('password').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
  check('phone').notEmpty().withMessage('Telefone é obrigatório'),
  check('vehicle.model').notEmpty().withMessage('Modelo do veículo é obrigatório'),
  check('vehicle.plate').notEmpty().withMessage('Placa do veículo é obrigatória'),
  check('documents.cnh').notEmpty().withMessage('CNH é obrigatória'),
  check('documents.cpf').notEmpty().withMessage('CPF é obrigatório')
];

module.exports = {
  driverRegisterValidation
}; 