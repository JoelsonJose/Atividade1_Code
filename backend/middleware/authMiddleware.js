const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
  }

  try {
    const defaultSecret = process.env.JWT_SECRET || 'supersecretkey_change_in_production';
    // Espera formato "Bearer TOKEN"
    const verified = jwt.verify(token.replace('Bearer ', ''), defaultSecret);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Token inválido.' });
  }
};

module.exports = authMiddleware;
