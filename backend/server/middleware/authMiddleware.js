const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

const protect = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization || '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  const cookieToken = req.cookies?.token;
  const token = bearerToken || cookieToken;

  if (!token) throw new AppError('Not authorized, token missing', 401);
  if (!process.env.JWT_SECRET) throw new AppError('JWT secret is not configured', 500);

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.userId).select('-password');
  if (!user) throw new AppError('User not found', 401);

  req.user = user;
  next();
});

module.exports = { protect };
