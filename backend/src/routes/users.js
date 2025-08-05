/**
 * User Routes
 * Routes for user profile management and user operations
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const { body, param, query } = require('express-validator');
const { validateRequest } = require('../middleware/validation');

// Validation rules
const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Invalid phone number format'),
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  body('experience')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Experience must be a non-negative integer'),
  body('location')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters')
];

const userIdValidation = [
  param('userId')
    .isUUID()
    .withMessage('Invalid user ID format')
];

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// All user routes require authentication
router.use(authenticate);

// User profile management
router.get('/profile', userController.getProfile);
router.put('/profile', updateProfileValidation, validateRequest, userController.updateProfile);
router.delete('/profile', userController.deleteProfile);

// User operations
router.get('/:userId', userIdValidation, validateRequest, userController.getUserById);

// Admin routes
router.get('/admin/all-users', 
  authorize(['admin']), 
  paginationValidation, 
  validateRequest, 
  userController.getAllUsers
);

router.put('/admin/:userId/status', 
  authorize(['admin']), 
  userIdValidation, 
  validateRequest, 
  userController.updateUserStatus
);

module.exports = router;
