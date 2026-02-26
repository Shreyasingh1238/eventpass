const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const generateToken = require('../utils/generateToken');
const getCookieOptions = require('../utils/cookieOptions');
const { upsertRoleAccount } = require('../utils/syncRoleAccounts');

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  age: user.age,
  gender: user.gender,
  volunteerStatus: user.volunteerStatus,
  createdAt: user.createdAt
});

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'user', age, gender, adminKey } = req.body;
  if (!name || !email || !password) throw new AppError('name, email and password are required', 400);

  if (!['user', 'volunteer', 'admin'].includes(role)) {
    throw new AppError('Invalid role', 400);
  }
  if (role === 'admin' && adminKey !== process.env.ADMIN_SECRET_KEY) {
    throw new AppError('Admin registration is restricted', 403);
  }

  const exists = await User.findOne({ email }).lean();
  if (exists) throw new AppError('Email already exists', 409);

  const volunteerStatus = role === 'volunteer' ? 'pending' : 'na';
  const user = await User.create({
    name,
    email,
    password,
    role,
    age: Number(age) || 21,
    gender: gender || 'other',
    volunteerStatus
  });
  await upsertRoleAccount(user);

  const token = generateToken(user._id, user.role, role === 'admin' ? process.env.ADMIN_JWT_EXPIRES_IN || '2h' : null);
  res.cookie('token', token, getCookieOptions());

  res.status(201).json({
    success: true,
    data: { user: sanitizeUser(user) }
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) throw new AppError('email and password are required', 400);

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    throw new AppError('Invalid credentials', 401);
  }
  if (user.role === 'admin') {
    throw new AppError('Use /admin/login for admin access', 403);
  }
  if (role && user.role !== role) {
    throw new AppError(`This account is ${user.role}. Login with correct role option.`, 403);
  }

  const token = generateToken(user._id, user.role);
  res.cookie('token', token, getCookieOptions());
  res.json({
    success: true,
    data: { user: sanitizeUser(user) }
  });
});

const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new AppError('email and password are required', 400);

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password)) || user.role !== 'admin') {
    throw new AppError('Invalid admin credentials', 401);
  }

  const token = generateToken(user._id, user.role, process.env.ADMIN_JWT_EXPIRES_IN || '2h');
  res.cookie('token', token, getCookieOptions());
  res.json({
    success: true,
    data: { user: sanitizeUser(user) }
  });
});

const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

const logout = asyncHandler(async (_req, res) => {
  res.clearCookie('token', getCookieOptions());
  res.json({ success: true, message: 'Logged out' });
});

module.exports = { register, login, adminLogin, me, logout };
