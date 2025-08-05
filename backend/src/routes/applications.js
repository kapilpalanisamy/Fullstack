/**
 * Application Routes  
 * Routes for job application management
 */

const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { authenticate, authorize } = require('../middleware/auth');
const { body, param, query } = require('express-validator');
const { validateRequest } = require('../middleware/validation');

// Validation rules
const createApplicationValidation = [
  body('jobId')
    .notEmpty()
    .withMessage('Job ID is required')
    .isUUID()
    .withMessage('Invalid job ID format'),
  body('coverLetter')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Cover letter must not exceed 2000 characters'),
  body('resume')
    .optional()
    .isURL()
    .withMessage('Resume must be a valid URL'),
  body('expectedSalary')
    .optional()
    .isNumeric()
    .withMessage('Expected salary must be a number')
];

const updateApplicationValidation = [
  param('applicationId')
    .isUUID()
    .withMessage('Invalid application ID format'),
  body('status')
    .isIn(['PENDING', 'REVIEWED', 'INTERVIEWED', 'ACCEPTED', 'REJECTED'])
    .withMessage('Invalid application status'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters')
];

const applicationIdValidation = [
  param('applicationId')
    .isUUID()
    .withMessage('Invalid application ID format')
];

const jobIdValidation = [
  param('jobId')
    .isUUID()
    .withMessage('Invalid job ID format')
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
    .isIn(['PENDING', 'REVIEWED', 'INTERVIEWED', 'ACCEPTED', 'REJECTED'])
    .withMessage('Invalid application status filter')
];

// All application routes require authentication
router.use(authenticate);

// Job seeker routes
router.post('/', createApplicationValidation, validateRequest, applicationController.createApplication);
router.get('/my-applications', paginationValidation, validateRequest, applicationController.getMyApplications);
router.get('/:applicationId', applicationIdValidation, validateRequest, applicationController.getApplicationById);
router.delete('/:applicationId', applicationIdValidation, validateRequest, applicationController.withdrawApplication);

// Recruiter routes
router.get('/job/:jobId', 
  authorize(['recruiter', 'admin']), 
  jobIdValidation, 
  paginationValidation, 
  validateRequest, 
  applicationController.getJobApplications
);

router.put('/:applicationId/status', 
  authorize(['recruiter', 'admin']), 
  updateApplicationValidation, 
  validateRequest, 
  applicationController.updateApplicationStatus
);

// Admin routes
router.get('/admin/all-applications',
  authorize(['admin']),
  paginationValidation,
  validateRequest,
  applicationController.getAllApplications
);

router.get('/admin/statistics',
  authorize(['admin']),
  applicationController.getApplicationStatistics
);

module.exports = router;
