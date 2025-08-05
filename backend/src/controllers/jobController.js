/**
 * Job Controller
 * Handles HTTP requests for job management
 */

const jobService = require('../services/jobService');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../config/logger');

class JobController {
  /**
   * Create a new job posting
   * POST /api/jobs
   */
  createJob = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const jobData = req.body;

    // Validate required fields
    const requiredFields = ['title', 'description', 'company_id', 'location', 'job_type'];
    const missingFields = requiredFields.filter(field => !jobData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    const job = await jobService.createJob(jobData, userId);

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: { job }
    });
  });

  /**
   * Get all jobs with filtering and pagination
   * GET /api/jobs
   */
  getJobs = asyncHandler(async (req, res) => {
    const filters = {
      search: req.query.search,
      location: req.query.location,
      jobType: req.query.jobType,
      experience: req.query.experience,
      salary: req.query.salary,
      company: req.query.company,
      skills: req.query.skills ? req.query.skills.split(',') : undefined
    };

    const pagination = {
      page: req.query.page,
      limit: req.query.limit,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder
    };

    const result = await jobService.getJobs(filters, pagination);

    res.status(200).json({
      success: true,
      message: 'Jobs retrieved successfully',
      data: result
    });
  });

  /**
   * Get single job by ID
   * GET /api/jobs/:id
   */
  getJobById = asyncHandler(async (req, res) => {
    const jobId = req.params.id;

    const job = await jobService.getJobById(jobId);

    res.status(200).json({
      success: true,
      message: 'Job retrieved successfully',
      data: { job }
    });
  });

  /**
   * Update job posting
   * PUT /api/jobs/:id
   */
  updateJob = asyncHandler(async (req, res) => {
    const jobId = req.params.id;
    const userId = req.user.id;
    const updateData = req.body;

    const job = await jobService.updateJob(jobId, updateData, userId);

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: { job }
    });
  });

  /**
   * Delete job posting
   * DELETE /api/jobs/:id
   */
  deleteJob = asyncHandler(async (req, res) => {
    const jobId = req.params.id;
    const userId = req.user.id;

    const result = await jobService.deleteJob(jobId, userId);

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully',
      data: result
    });
  });

  /**
   * Get jobs created by current user
   * GET /api/jobs/my-jobs
   */
  getMyJobs = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const pagination = {
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status
    };

    const result = await jobService.getUserJobs(userId, pagination);

    res.status(200).json({
      success: true,
      message: 'User jobs retrieved successfully',
      data: result
    });
  });

  /**
   * Search jobs
   * GET /api/jobs/search
   */
  searchJobs = asyncHandler(async (req, res) => {
    const { q: query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const filters = {
      search: query,
      location: req.query.location,
      jobType: req.query.jobType,
      experience: req.query.experience
    };

    const pagination = {
      page: req.query.page || 1,
      limit: req.query.limit || 10
    };

    const result = await jobService.getJobs(filters, pagination);

    res.status(200).json({
      success: true,
      message: 'Search completed successfully',
      data: result
    });
  });

  /**
   * Get job statistics
   * GET /api/jobs/stats
   */
  getJobStats = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // This would be implemented based on specific requirements
    // For now, returning a placeholder response
    const stats = {
      totalJobs: 0,
      activeJobs: 0,
      totalApplications: 0,
      viewsThisMonth: 0
    };

    res.status(200).json({
      success: true,
      message: 'Job statistics retrieved successfully',
      data: { stats }
    });
  });
}

module.exports = new JobController();
