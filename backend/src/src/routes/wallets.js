/**
 * Wallet Routes
 * Routes for Phantom wallet integration and blockchain operations
 */

const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { authenticate, authorize } = require('../middleware/auth');
const { body, param } = require('express-validator');
const { validateRequest } = require('../middleware/validation');

// Validation rules
const connectWalletValidation = [
  body('walletAddress')
    .notEmpty()
    .withMessage('Wallet address is required')
    .isLength({ min: 32, max: 50 })
    .withMessage('Invalid wallet address format'),
  body('signature')
    .optional()
    .notEmpty()
    .withMessage('Signature cannot be empty if provided')
];

const walletAddressValidation = [
  param('address')
    .notEmpty()
    .withMessage('Wallet address is required')
    .isLength({ min: 32, max: 50 })
    .withMessage('Invalid wallet address format')
];

const verifyTransactionValidation = [
  body('signature')
    .notEmpty()
    .withMessage('Transaction signature is required')
    .isLength({ min: 80, max: 90 })
    .withMessage('Invalid transaction signature format')
];

const validateOwnershipValidation = [
  body('walletAddress')
    .notEmpty()
    .withMessage('Wallet address is required'),
  body('message')
    .notEmpty()
    .withMessage('Message is required'),
  body('signature')
    .notEmpty()
    .withMessage('Signature is required')
];

// All wallet routes require authentication
router.use(authenticate);

// Wallet connection management
router.post('/connect', connectWalletValidation, validateRequest, walletController.connectWallet);
router.post('/disconnect', walletController.disconnectWallet);
router.get('/my-wallet', walletController.getMyWallet);

// Wallet operations
router.get('/balance/:address', walletAddressValidation, validateRequest, walletController.getWalletBalance);
router.get('/transactions/:address', walletAddressValidation, validateRequest, walletController.getWalletTransactions);

// Transaction verification
router.post('/verify-transaction', verifyTransactionValidation, validateRequest, walletController.verifyTransaction);
router.post('/validate-ownership', validateOwnershipValidation, validateRequest, walletController.validateOwnership);

// Network information (public)
router.get('/network-status', walletController.getNetworkStatus);

module.exports = router;
