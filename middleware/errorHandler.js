const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = { ...err };
  error.message = err.message;

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message };
    return res.status(400).json({
      error: 'Validation Error',
      details: message
    });
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const message = 'Resource already exists';
    error = { message };
    return res.status(400).json({
      error: 'Duplicate Resource',
      details: message
    });
  }

  // Sequelize foreign key constraint error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    const message = 'Referenced resource does not exist';
    error = { message };
    return res.status(400).json({
      error: 'Foreign Key Constraint Error',
      details: message
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid Token',
      message: 'The provided token is invalid'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token Expired',
      message: 'The provided token has expired'
    });
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'File Too Large',
      message: 'The uploaded file exceeds the maximum allowed size'
    });
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      error: 'Too Many Files',
      message: 'Too many files uploaded'
    });
  }

  // Default server error
  res.status(error.statusCode || 500).json({
    error: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;