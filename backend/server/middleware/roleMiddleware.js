const AppError = require('../utils/appError');

const allowRoles = (...roles) => (req, _res, next) => {
  if (!req.user) {
    return next(new AppError('Not authorized', 401));
  }
  if (!roles.includes(req.user.role)) {
    return next(new AppError('Forbidden: insufficient role', 403));
  }
  next();
};

module.exports = { allowRoles };

