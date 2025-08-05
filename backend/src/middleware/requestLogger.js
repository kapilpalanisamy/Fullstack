/**
 * Request Logger Middleware
 * Log HTTP requests with performance metrics
 */

const logger = require('../config/logger');

/**
 * Request Logger Middleware
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Store original end function
  const originalEnd = res.end;
  
  // Override res.end to capture response time
  res.end = function(chunk, encoding) {
    const responseTime = Date.now() - startTime;
    
    // Log the request
    logger.logRequest(req, res, responseTime);
    
    // Call original end function
    originalEnd.call(this, chunk, encoding);
  };
  
  // Add request ID for tracing
  req.requestId = generateRequestId();
  res.setHeader('X-Request-ID', req.requestId);
  
  next();
};

/**
 * Generate unique request ID
 */
const generateRequestId = () => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Request sanitizer - remove sensitive data from logs
 */
const sanitizeRequest = (req) => {
  const sanitized = {
    method: req.method,
    url: req.originalUrl,
    headers: { ...req.headers },
    body: { ...req.body },
    query: { ...req.query },
    params: { ...req.params }
  };

  // Remove sensitive information
  delete sanitized.headers.authorization;
  delete sanitized.headers.cookie;
  
  if (sanitized.body.password) sanitized.body.password = '[REDACTED]';
  if (sanitized.body.confirmPassword) sanitized.body.confirmPassword = '[REDACTED]';
  if (sanitized.body.currentPassword) sanitized.body.currentPassword = '[REDACTED]';
  if (sanitized.body.newPassword) sanitized.body.newPassword = '[REDACTED]';

  return sanitized;
};

module.exports = requestLogger;
