/**
 * Validation Middleware
 * Middleware for request validation using express-validator
 */

const { validationResult } = require('express-validator');
const logger = require('../config/logger');

/**
 * Validate request and return errors if any
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));

    logger.warn('Validation failed', {
      errors: errorMessages,
      path: req.path,
      method: req.method
    });

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
  }

  next();
};

module.exports = {
  validateRequest
};
