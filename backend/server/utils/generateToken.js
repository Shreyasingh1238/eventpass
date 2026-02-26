const jwt = require('jsonwebtoken');

const generateToken = (userId, role, expiresIn) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: expiresIn || process.env.JWT_EXPIRES_IN || '7d'
  });
};

module.exports = generateToken;
