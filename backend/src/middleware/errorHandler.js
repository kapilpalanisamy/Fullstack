/**
 * Global Error Handler Middleware
 * Centralized error handling with proper logging and responses
 */

const logger = require('../config/logger');
const config = require('../config/config');

/**
 * Custom Application Error Class
 */
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle Sequelize Database Errors
 */
const handleSequelizeError = (error) => {
  let message = 'Database operation failed';
  let statusCode = 500;

  switch (error.name) {
    case 'SequelizeValidationError':
      message = error.errors.map(err => err.message).join(', ');
      statusCode = 400;
      break;
    
    case 'SequelizeUniqueConstraintError':
      const field = error.errors[0]?.path || 'field';
      message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
      statusCode = 409;
      break;
    
    case 'SequelizeForeignKeyConstraintError':
      message = 'Referenced record does not exist';
      statusCode = 400;
      break;
    
    case 'SequelizeConnectionError':
      message = 'Database connection failed';
      statusCode = 503;
      break;
    
    case 'SequelizeTimeoutError':
      message = 'Database operation timed out';
      statusCode = 504;
      break;
    
    default:
      message = config.nodeEnv === 'development' ? error.message : 'Database operation failed';
  }

  return new AppError(message, statusCode);
};

/**
 * Handle JWT Errors
 */
const handleJWTError = (error) => {
  let message = 'Authentication failed';
  
  if (error.name === 'JsonWebTokenError') {
    message = 'Invalid token. Please log in again.';
  } else if (error.name === 'TokenExpiredError') {
    message = 'Your token has expired. Please log in again.';
  }
  
  return new AppError(message, 401);
};

/**
 * Handle Multer File Upload Errors
 */
const handleMulterError = (error) => {
  let message = 'File upload failed';
  let statusCode = 400;

  switch (error.code) {
    case 'LIMIT_FILE_SIZE':
      message = 'File too large. Maximum size is 10MB';
      break;
    case 'LIMIT_FILE_COUNT':
      message = 'Too many files uploaded';
      break;
    case 'LIMIT_UNEXPECTED_FILE':
      message = 'Unexpected file field';
      break;
    default:
      message = error.message || message;
  }

  return new AppError(message, statusCode);
};

/**
 * Send Error Response in Development
 */
const sendErrorDev = (err, req, res) => {
  // Log the full error
  logger.logError(err, req);

  res.status(err.statusCode).json({
    success: false,
    error: {
      message: err.message,
      status: err.status,
      statusCode: err.statusCode,
      stack: err.stack,
      ...(req.body && Object.keys(req.body).length && { requestBody: req.body }),
      ...(req.params && Object.keys(req.params).length && { requestParams: req.params }),
      ...(req.query && Object.keys(req.query).length && { requestQuery: req.query })
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  });
};

/**
 * Send Error Response in Production
 */
const sendErrorProd = (err, req, res) => {
  // Log error details
  logger.logError(err, req);

  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      timestamp: new Date().toISOString()
    });
  } else {
    // Programming or other unknown error: don't leak error details
    res.status(500).json({
      success: false,
      message: 'Something went wrong on our end. Please try again later.',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Main Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Handle specific error types
  if (err.name?.includes('Sequelize')) {
    error = handleSequelizeError(err);
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    error = handleJWTError(err);
  } else if (err.name === 'MulterError') {
    error = handleMulterError(err);
  } else if (err.name === 'ValidationError') {
    error = new AppError(err.message, 400);
  } else if (err.code === 11000) {
    // MongoDB duplicate key error
    const field = Object.keys(err.keyValue)[0];
    error = new AppError(`${field} already exists`, 409);
  } else if (err.name === 'CastError') {
    error = new AppError('Invalid ID format', 400);
  }

  // Set default values if not already set
  if (!error.statusCode) error.statusCode = 500;
  if (!error.status) error.status = 'error';
  if (error.isOperational === undefined) error.isOperational = false;

  // Send appropriate error response
  if (config.nodeEnv === 'development') {
    sendErrorDev(error, req, res);
  } else {
    sendErrorProd(error, req, res);
  }
};

/**
 * Async Error Wrapper
 * Wraps async route handlers to catch errors automatically
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
  const err = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(err);
};

module.exports = {
  AppError,
  errorHandler,
  asyncHandler,
  notFoundHandler
};
