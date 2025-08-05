/**
 * Company Routes
 * Routes for company management and operations
 */

const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { authenticate, authorize } = require('../middleware/auth');
const { body, param, query } = require('express-validator');  
const { validateRequest } = require('../middleware/validation');

// Validation rules
const createCompanyValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('website')
    .optional()
    .isURL()
    .withMessage('Invalid website URL'),
  body('industry')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Industry must not exceed 50 characters'),
  body('company_size')
    .optional()
    .isIn(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'])
    .withMessage('Invalid company size'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location must not exceed 100 characters')
];

const updateCompanyValidation = [
  param('companyId')
    .isUUID()
    .withMessage('Invalid company ID format'),
  ...createCompanyValidation.map(rule => 
    rule._condition ? rule.optional() : rule
  )
];

const companyIdValidation = [
  param('companyId')
    .isUUID()
    .withMessage('Invalid company ID format')
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
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters')
];

// Public company routes (no authentication required)
router.get('/', paginationValidation, validateRequest, companyController.getCompanies);
router.get('/:companyId', companyIdValidation, validateRequest, companyController.getCompanyById);

// Protected routes (authentication required)
router.use(authenticate);

// Company management (recruiters only)
router.post('/', 
  authorize(['recruiter', 'admin']), 
  createCompanyValidation, 
  validateRequest, 
  companyController.createCompany
);

router.put('/:companyId', 
  authorize(['recruiter', 'admin']), 
  updateCompanyValidation, 
  validateRequest, 
  companyController.updateCompany
);

router.delete('/:companyId', 
  authorize(['recruiter', 'admin']), 
  companyIdValidation, 
  validateRequest, 
  companyController.deleteCompany
);

// Company jobs
router.get('/:companyId/jobs', 
  companyIdValidation, 
  paginationValidation, 
  validateRequest, 
  companyController.getCompanyJobs
);

// Admin routes
router.get('/admin/all-companies',
  authorize(['admin']),
  paginationValidation,
  validateRequest,
  companyController.getAllCompanies
);

module.exports = router;
