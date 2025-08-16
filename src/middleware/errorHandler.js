const { logger, logError } = require('../utils/logger');

// Custom error classes
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400);
    this.errors = errors;
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429);
  }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logError(err, `${req.method} ${req.path}`);

  // Sequelize errors
  if (err.name === 'SequelizeValidationError') {
    const message = 'Validation Error';
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message,
      value: e.value
    }));
    error = new ValidationError(message, errors);
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    const message = 'Duplicate field value entered';
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message,
      value: e.value
    }));
    error = new ValidationError(message, errors);
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    const message = 'Referenced resource does not exist';
    error = new ValidationError(message);
  }

  if (err.name === 'SequelizeDatabaseError') {
    const message = 'Database operation failed';
    error = new AppError(message, 500);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new AuthenticationError(message);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new AuthenticationError(message);
  }

  // Cast error (MongoDB)
  if (err.name === 'CastError') {
    const message = 'Invalid resource ID';
    error = new ValidationError(message);
  }

  // Duplicate key error
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ValidationError(message);
  }

  // Validation error
  if (err.name === 'ValidationError') {
    const message = 'Validation Error';
    const errors = Object.values(err.errors).map(val => val.message);
    error = new ValidationError(message, errors);
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large';
    error = new ValidationError(message);
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file field';
    error = new ValidationError(message);
  }

  // Rate limit error
  if (err.status === 429) {
    error = new RateLimitError();
  }

  // Default error
  if (!error.statusCode) {
    error.statusCode = 500;
    error.message = 'Internal Server Error';
  }

  // Development error response
  if (process.env.NODE_ENV === 'development') {
    res.status(error.statusCode).json({
      success: false,
      error: error.message,
      statusCode: error.statusCode,
      stack: error.stack,
      ...(error.errors && { errors: error.errors }),
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  } else {
    // Production error response
    res.status(error.statusCode).json({
      success: false,
      error: error.isOperational ? error.message : 'Internal Server Error',
      statusCode: error.statusCode,
      ...(error.errors && { errors: error.errors }),
      timestamp: new Date().toISOString(),
    });
  }
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 404 handler
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.originalUrl} not found`);
  next(error);
};

// Global error handler for unhandled rejections
const handleUnhandledRejection = (err) => {
  logError(err, 'Unhandled Rejection');
  process.exit(1);
};

// Global error handler for uncaught exceptions
const handleUncaughtException = (err) => {
  logError(err, 'Uncaught Exception');
  process.exit(1);
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFoundHandler,
  handleUnhandledRejection,
  handleUncaughtException,
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
}; 