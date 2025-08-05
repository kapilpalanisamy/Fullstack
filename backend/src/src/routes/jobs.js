/**
 * Job Routes
 * Routes for job management and operations
 */

const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authenticate, authorize } = require('../middleware/auth');
const { body, query } = require('express-validator');
const { validateRequest } = require('../middleware/validation');

// Validation rules
const createJobValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Job title must be between 5 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 50, max: 5000 })
    .withMessage('Job description must be between 50 and 5000 characters'),
  body('company_id')
    .isUUID()
    .withMessage('Valid company ID is required'),
  body('location')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters'),
  body('job_type')
    .isIn(['full-time', 'part-time', 'contract', 'internship', 'freelance'])
    .withMessage('Invalid job type'),
  body('experience_level')
    .optional()
    .isIn(['entry', 'mid', 'senior', 'executive'])
    .withMessage('Invalid experience level'),
  body('salary_min')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum salary must be a positive number'),
  body('salary_max')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum salary must be a positive number'),
  body('required_skills')
    .optional()
    .isArray()
    .withMessage('Required skills must be an array'),
  body('benefits')
    .optional()
    .isArray()
    .withMessage('Benefits must be an array'),
  body('application_deadline')
    .optional()
    .isISO8601()
    .withMessage('Application deadline must be a valid date')
];

const updateJobValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Job title must be between 5 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 50, max: 5000 })
    .withMessage('Job description must be between 50 and 5000 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters'),
  body('job_type')
    .optional()
    .isIn(['full-time', 'part-time', 'contract', 'internship', 'freelance'])
    .withMessage('Invalid job type'),
  body('experience_level')
    .optional()
    .isIn(['entry', 'mid', 'senior', 'executive'])
    .withMessage('Invalid experience level'),
  body('salary_min')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum salary must be a positive number'),
  body('salary_max')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum salary must be a positive number'),
  body('required_skills')
    .optional()
    .isArray()
    .withMessage('Required skills must be an array'),
  body('benefits')
    .optional()
    .isArray()
    .withMessage('Benefits must be an array'),
  body('application_deadline')
    .optional()
    .isISO8601()
    .withMessage('Application deadline must be a valid date')
];

const searchValidation = [
  query('q')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Search query must be between 1 and 200 characters'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Public routes
router.get('/', jobController.getJobs);
router.get('/search', searchValidation, validateRequest, jobController.searchJobs);
router.get('/:id', jobController.getJobById);

// Protected routes - require authentication
router.use(authenticate);

// Recruiter-only routes
router.post('/', authorize('recruiter'), createJobValidation, validateRequest, jobController.createJob);
router.put('/:id', authorize('recruiter'), updateJobValidation, validateRequest, jobController.updateJob);
router.delete('/:id', authorize('recruiter'), jobController.deleteJob);
router.get('/my/jobs', authorize('recruiter'), jobController.getMyJobs);
router.get('/my/stats', authorize('recruiter'), jobController.getJobStats);

module.exports = router;
