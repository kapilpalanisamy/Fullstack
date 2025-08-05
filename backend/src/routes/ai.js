/**
 * AI Routes
 * Routes for AI-powered features and OpenAI integration
 */

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticate, authorize } = require('../middleware/auth');
const { body, query } = require('express-validator');
const { validateRequest } = require('../middleware/validation');

// Validation rules
const extractSkillsValidation = [
  body('jobDescription')
    .notEmpty()
    .withMessage('Job description is required')
    .isLength({ min: 50, max: 5000 })
    .withMessage('Job description must be between 50 and 5000 characters'),
  body('jobTitle')
    .optional()
    .isLength({ min: 2, max: 200 })
    .withMessage('Job title must be between 2 and 200 characters')
];

const jobMatchValidation = [
  body('jobId')
    .notEmpty()
    .withMessage('Job ID is required')
    .isUUID()
    .withMessage('Invalid job ID format')
];

const enhanceJobDescriptionValidation = [
  body('jobDescription')
    .notEmpty()
    .withMessage('Job description is required')
    .isLength({ min: 50, max: 5000 })
    .withMessage('Job description must be between 50 and 5000 characters'),
  body('jobTitle')
    .optional()
    .isLength({ min: 2, max: 200 })
    .withMessage('Job title must be between 2 and 200 characters'),
  body('companyName')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters')
];

const skillSuggestionsValidation = [
  query('jobTitle')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Job title must be between 2 and 100 characters'),
  query('experienceLevel')
    .optional()
    .isIn(['ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE'])
    .withMessage('Invalid experience level')
];

// All AI routes require authentication
router.use(authenticate);

// Skill extraction (available to all authenticated users)
router.post('/extract-skills', 
  extractSkillsValidation, 
  validateRequest, 
  aiController.extractSkills
);

// Job recommendations (job seekers and all users)
router.get('/job-recommendations', 
  aiController.getJobRecommendations
);

// Job match calculation (job seekers and all users)
router.post('/job-match', 
  jobMatchValidation, 
  validateRequest, 
  aiController.calculateJobMatch
);

// Skill suggestions (job seekers and all users)
router.get('/skill-suggestions', 
  skillSuggestionsValidation, 
  validateRequest, 
  aiController.getSkillSuggestions
);

// Profile analysis (job seekers and all users)
router.get('/profile-analysis', 
  aiController.analyzeProfile
);

// Job description enhancement (recruiters and admins only)
router.post('/enhance-job-description', 
  authorize(['recruiter', 'admin']), 
  enhanceJobDescriptionValidation, 
  validateRequest, 
  aiController.enhanceJobDescription
);

module.exports = router;
