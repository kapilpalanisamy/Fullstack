/**
 * RizeOS Job Portal Backend Server
 * Clean Architecture Implementation
 * 
 * @author RizeOS Team
 * @version 1.0.0
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

// Configuration imports
const config = require('./config/config');
const database = require('./config/database');
const logger = require('./config/logger');

// Middleware imports
const { errorHandler } = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');

class Server {
  constructor() {
    this.app = express();
    this.port = config.port || 5000;
    
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Initialize application middlewares
   */
  initializeMiddlewares() {
    // Security middlewares
    this.app.use(helmet());
    this.app.use(compression());
    
    // CORS configuration
    this.app.use(cors({
      origin: config.corsOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.rateLimitWindowMs,
      max: config.rateLimitMaxRequests,
      message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(config.rateLimitWindowMs / 1000)
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api/', limiter);

    // Request parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging
    if (config.nodeEnv === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
    }

    this.app.use(requestLogger);
  }

  /**
   * Initialize application routes
   */
  initializeRoutes() {
    // Import routes
    const routes = require('./routes');
    
    // Use all routes
    this.app.use('/', routes);
  }

  /**
   * Initialize error handling
   */
  initializeErrorHandling() {
    this.app.use(errorHandler);
  }

  /**
   * Start the server
   */
  async start() {
    try {
      // Test database connection
      await database.sequelize.authenticate();
      logger.info('Database connection established successfully');

      // Sync database models (in development)
      if (config.nodeEnv === 'development') {
        await database.sequelize.sync({ alter: true });
        logger.info('Database models synchronized');
      }

      // Start server
      this.app.listen(this.port, () => {
        logger.info(`🚀 RizeOS Job Portal Backend Server running on port ${this.port}`);
        logger.info(`📖 Environment: ${config.nodeEnv}`);
        logger.info(`🔗 Health check: http://localhost:${this.port}/health`);
        
        if (config.nodeEnv === 'development') {
          logger.info(`📚 API Documentation: http://localhost:${this.port}/api-docs`);
        }
      });
    } catch (error) {
      logger.error('Unable to start server:', error);
      process.exit(1);
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    logger.info('Shutting down server gracefully...');
    
    try {
      await database.close();
      logger.info('Database connection closed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => server.shutdown());
process.on('SIGINT', () => server.shutdown());

// Create and start server
const server = new Server();
server.start();

module.exports = server;
