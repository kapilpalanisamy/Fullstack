/**
 * Application Configuration
 * Centralized configuration management
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const config = {
  // Server Configuration
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  
  // Database Configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    database: process.env.DB_NAME || 'job_portal_dev',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    url: process.env.DB_URL,
    dialect: 'postgres',
    ssl: process.env.DB_SSL === 'true',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-fallback-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  },

  // Ethereum Configuration
  ethereum: {
    network: process.env.ETHEREUM_NETWORK || 'sepolia',
    rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com',
    chainId: parseInt(process.env.ETHEREUM_CHAIN_ID, 10) || 11155111,
    privateKey: process.env.ETHEREUM_PRIVATE_KEY,
    address: process.env.ETHEREUM_ADDRESS,
    gasLimit: parseInt(process.env.GAS_LIMIT, 10) || 3000000,
    gasPrice: process.env.GAS_PRICE || '20000000000',
    jobPostingFee: parseFloat(process.env.JOB_POSTING_FEE_ETH) || 0.01
  },

  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-3.5-turbo',
    temperature: 0.1,
    maxTokens: 500
  },

  // Email Configuration
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    from: process.env.EMAIL_FROM || 'noreply@jobportal.com'
  },

  // Cloudinary Configuration
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  },

  // Security Configuration
  security: {
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173'
  },

  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,

  // CORS Configuration
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log'
  },

  // File Upload Configuration
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    uploadDir: 'uploads/'
  },

  // Pagination Configuration
  pagination: {
    defaultLimit: 20,
    maxLimit: 100
  }
};

// Validation function
const validateConfig = () => {
  // Temporarily disabled for Ethereum migration
  console.log('🚀 Configuration validation temporarily disabled during Ethereum migration');
  
  const requiredEnvVars = [
    'JWT_SECRET',
    'DB_URL'
    // Temporarily removed blockchain validation during migration
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`⚠️  Missing critical environment variables: ${missingVars.join(', ')}`);
    console.warn('Please check your .env file');
  }

  // Additional validations
  if (config.jwt.secret === 'your-fallback-secret-key') {
    console.warn('⚠️  Using fallback JWT secret. Please set JWT_SECRET in production!');
  }
};

// Validate configuration on load
validateConfig();

module.exports = config;
