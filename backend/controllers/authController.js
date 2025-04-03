const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Verifica email existente
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }

    // Cria usuário
    const user = new User({
      name,
      email,
      password,
      phone
    });

    await user.save();

    // Gera token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove senha do retorno
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro ao registrar usuário' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Credenciais inválidas' });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro ao fazer login' });
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