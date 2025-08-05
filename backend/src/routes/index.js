/**
 * Routes Index
 * Main router that combines all route modules
 */

const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const userRoutes = require('./users');
const companyRoutes = require('./companies');
const jobRoutes = require('./jobs');
const applicationRoutes = require('./applications');
const walletRoutes = require('./wallets');
const paymentRoutes = require('./payments');
const aiRoutes = require('./ai');

// API version
const API_VERSION = '/api/v1';

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Job Portal API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    features: {
      blockchain: 'Solana Web3 integration with Phantom wallet',
      payments: 'Cryptocurrency payments for job postings',
      authentication: 'JWT-based auth with role management',
      database: 'PostgreSQL with Sequelize ORM'
    },
    endpoints: {
      auth: `${API_VERSION}/auth`,
      users: `${API_VERSION}/users`,
      companies: `${API_VERSION}/companies`,
      jobs: `${API_VERSION}/jobs`,
      applications: `${API_VERSION}/applications`,
      wallets: `${API_VERSION}/wallets`,
      payments: `${API_VERSION}/payments`,
      ai: `${API_VERSION}/ai`
    }
  });
});

// Mount route modules
router.use(`${API_VERSION}/auth`, authRoutes);
router.use(`${API_VERSION}/users`, userRoutes);
router.use(`${API_VERSION}/companies`, companyRoutes);
router.use(`${API_VERSION}/jobs`, jobRoutes);
router.use(`${API_VERSION}/applications`, applicationRoutes);
router.use(`${API_VERSION}/wallets`, walletRoutes);
router.use(`${API_VERSION}/payments`, paymentRoutes);
router.use(`${API_VERSION}/ai`, aiRoutes);

// 404 handler for API routes
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.path,
    method: req.method
  });
});

module.exports = router;
