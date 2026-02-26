const notFound = (req, _res, next) => {
  const error = new Error(`Not Found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  // eslint-disable-next-line no-console
  console.error('API_ERROR', statusCode, message);

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
};

module.exports = { notFound, errorHandler };
