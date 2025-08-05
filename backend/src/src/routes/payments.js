/**
 * Payment Routes
 * Routes for blockchain payment processing and job posting payments
 */

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate, authorize } = require('../middleware/auth');
const { body, param, query } = require('express-validator');
const { validateRequest } = require('../middleware/validation');

// Validation rules
const createPaymentValidation = [
  body('jobId')
    .notEmpty()
    .withMessage('Job ID is required')
    .isUUID()
    .withMessage('Invalid job ID format'),
  body('paymentType')
    .isIn(['JOB_POSTING', 'PREMIUM_LISTING', 'FEATURED_JOB'])
    .withMessage('Invalid payment type'),
  body('walletAddress')
    .notEmpty()
    .withMessage('Wallet address is required')
    .isLength({ min: 32, max: 50 })
    .withMessage('Invalid wallet address format')
];

const confirmPaymentValidation = [
  param('paymentId')
    .isUUID()
    .withMessage('Invalid payment ID format'),
  body('transactionSignature')
    .notEmpty()
    .withMessage('Transaction signature is required')
    .isLength({ min: 80, max: 90 })
    .withMessage('Invalid transaction signature format')
];

const paymentIdValidation = [
  param('paymentId')
    .isUUID()
    .withMessage('Invalid payment ID format')
];

const refundValidation = [
  param('paymentId')
    .isUUID()
    .withMessage('Invalid payment ID format'),
  body('reason')
    .notEmpty()
    .withMessage('Refund reason is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Refund reason must be between 10 and 500 characters')
];

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['PENDING', 'CONFIRMED', 'FAILED', 'REFUNDED'])
    .withMessage('Invalid payment status')
];

// All payment routes require authentication
router.use(authenticate);

// Payment creation and management
router.post('/create', createPaymentValidation, validateRequest, paymentController.createPayment);
router.post('/:paymentId/confirm', confirmPaymentValidation, validateRequest, paymentController.confirmPayment);
router.get('/:paymentId', paymentIdValidation, validateRequest, paymentController.getPayment);
router.get('/:paymentId/status', paymentIdValidation, validateRequest, paymentController.getPaymentStatus);

// User payment history
router.get('/history/my-payments', paginationValidation, validateRequest, paymentController.getUserPayments);

// Fee estimation
router.get('/fees/estimate', paymentController.estimateFees);

// Admin routes
router.post('/:paymentId/refund', 
  authorize(['admin']), 
  refundValidation, 
  validateRequest, 
  paymentController.processRefund
);

router.get('/admin/all-payments', 
  authorize(['admin']), 
  paginationValidation, 
  validateRequest, 
  paymentController.getAllPayments
);

router.get('/admin/statistics', 
  authorize(['admin']), 
  paymentController.getPaymentStatistics
);

module.exports = router;
