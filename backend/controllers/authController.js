const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  try {
    console.log('Iniciando registro:', req.body);
    
    const { name, email, password, phone, role } = req.body;

    // Validações básicas
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        error: 'Dados incompletos',
        required: ['name', 'email', 'password', 'phone']
      });
    }

    // Verifica email existente
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        error: 'Email já cadastrado'
      });
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Cria usuário
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      role: role || 'passenger'
    });

    console.log('Salvando usuário:', {
      name: user.name,
      email: user.email,
      role: user.role
    });

    await user.save();

    // Gera token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove senha do retorno
    const userResponse = user.toObject();
    delete userResponse.password;

    console.log('Usuário registrado com sucesso:', {
      id: user._id,
      email: user.email
    });

    res.status(201).json({
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    
    // Tratamento de erros específicos do MongoDB
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Email já cadastrado',
        details: error.keyValue
      });
    }

    // Erros de validação do Mongoose
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Erro de validação',
        details: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      error: 'Erro ao registrar usuário',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.login = async (req, res) => {
  try {
    console.log('Tentativa de login:', req.body);
    
    const { email, password } = req.body;

    // Validações
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email e senha são obrigatórios'
      });
    }

    // Busca o usuário
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({
        error: 'Credenciais inválidas'
      });
    }

    // Verifica a senha
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({
        error: 'Credenciais inválidas'
      });
    }

    // Gera o token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove a senha do objeto de resposta
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      error: 'Erro ao fazer login',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ message: 'Erro ao buscar perfil' });
  }
}; 