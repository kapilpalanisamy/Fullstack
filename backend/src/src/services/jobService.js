/**
 * Job Service
 * Business logic for job management
 */

const { Job, Company, User, Application } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../config/logger');
const { Op } = require('sequelize');

class JobService {
  /**
   * Create a new job posting
   */
  async createJob(jobData, userId) {
    try {
      const jobWithUser = {
        ...jobData,
        created_by: userId
      };

      const job = await Job.create(jobWithUser);

      // Fetch job with associated data
      const createdJob = await Job.findByPk(job.id, {
        include: [
          {
            model: Company,
            as: 'company',
            attributes: ['id', 'name', 'logo_url', 'location']
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      logger.info('Job created successfully', {
        jobId: job.id,
        userId,
        title: job.title
      });

      return createdJob;
    } catch (error) {
      logger.error('Job creation failed', {
        error: error.message,
        userId,
        jobData
      });
      throw error;
    }
  }

  /**
   * Get all jobs with filtering and pagination
   */
  async getJobs(filters = {}, pagination = {}) {
    try {
      const {
        search,
        location,
        jobType,
        experience,
        salary,
        company,
        skills
      } = filters;

      const {
        page = 1,
        limit = 20,
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = pagination;

      const offset = (page - 1) * limit;

      // Build where conditions
      const whereConditions = {
        is_active: true
      };

      if (search) {
        whereConditions[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      if (location) {
        whereConditions.location = { [Op.iLike]: `%${location}%` };
      }

      if (jobType) {
        whereConditions.job_type = jobType;
      }

      if (experience) {
        whereConditions.experience_level = experience;
      }

      if (salary) {
        const [minSalary, maxSalary] = salary.split('-').map(Number);
        if (minSalary) {
          whereConditions.salary_min = { [Op.gte]: minSalary };
        }
        if (maxSalary) {
          whereConditions.salary_max = { [Op.lte]: maxSalary };
        }
      }

      if (skills && skills.length > 0) {
        whereConditions.required_skills = {
          [Op.overlap]: skills
        };
      }

      // Company filter
      const includeConditions = [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'logo_url', 'location', 'industry'],
          ...(company && {
            where: {
              [Op.or]: [
                { name: { [Op.iLike]: `%${company}%` } },
                { industry: { [Op.iLike]: `%${company}%` } }
              ]
            }
          })
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name']
        }
      ];

      const { count, rows: jobs } = await Job.findAndCountAll({
        where: whereConditions,
        include: includeConditions,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortBy, sortOrder.toUpperCase()]],
        distinct: true
      });

      const totalPages = Math.ceil(count / limit);

      return {
        jobs,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalJobs: count,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      logger.error('Failed to fetch jobs', {
        error: error.message,
        filters,
        pagination
      });
      throw error;
    }
  }

  /**
   * Get single job by ID
   */
  async getJobById(jobId) {
    try {
      const job = await Job.findByPk(jobId, {
        include: [
          {
            model: Company,
            as: 'company',
            attributes: ['id', 'name', 'logo_url', 'location', 'industry', 'description']
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name', 'email']
          },
          {
            model: Application,
            as: 'applications',
            attributes: ['id', 'status'],
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'name']
              }
            ]
          }
        ]
      });

      if (!job) {
        throw new AppError('Job not found', 404);
      }

      // Increment view count
      await job.increment('view_count');

      return job;
    } catch (error) {
      logger.error('Failed to fetch job', {
        error: error.message,
        jobId
      });
      throw error;
    }
  }

  /**
   * Update job posting
   */
  async updateJob(jobId, updateData, userId) {
    try {
      const job = await Job.findByPk(jobId);

      if (!job) {
        throw new AppError('Job not found', 404);
      }

      // Check if user owns the job
      if (job.created_by !== userId) {
        throw new AppError('Unauthorized to update this job', 403);
      }

      await job.update(updateData);

      // Fetch updated job with associations
      const updatedJob = await Job.findByPk(jobId, {
        include: [
          {
            model: Company,
            as: 'company',
            attributes: ['id', 'name', 'logo_url', 'location']
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      logger.info('Job updated successfully', {
        jobId,
        userId,
        updatedFields: Object.keys(updateData)
      });

      return updatedJob;
    } catch (error) {
      logger.error('Job update failed', {
        error: error.message,
        jobId,
        userId
      });
      throw error;
    }
  }

  /**
   * Delete job posting
   */
  async deleteJob(jobId, userId) {
    try {
      const job = await Job.findByPk(jobId);

      if (!job) {
        throw new AppError('Job not found', 404);
      }

      // Check if user owns the job
      if (job.created_by !== userId) {
        throw new AppError('Unauthorized to delete this job', 403);
      }

      // Soft delete by setting is_active to false
      await job.update({ is_active: false });

      logger.info('Job deleted successfully', {
        jobId,
        userId,
        title: job.title
      });

      return { message: 'Job deleted successfully' };
    } catch (error) {
      logger.error('Job deletion failed', {
        error: error.message,
        jobId,
        userId
      });
      throw error;
    }
  }

  /**
   * Get jobs created by user
   */
  async getUserJobs(userId, pagination = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        status = 'all'
      } = pagination;

      const offset = (page - 1) * limit;

      const whereConditions = {
        created_by: userId
      };

      if (status !== 'all') {
        whereConditions.is_active = status === 'active';
      }

      const { count, rows: jobs } = await Job.findAndCountAll({
        where: whereConditions,
        include: [
          {
            model: Company,
            as: 'company',
            attributes: ['id', 'name', 'logo_url', 'location']
          },
          {
            model: Application,
            as: 'applications',
            attributes: ['id', 'status']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      const totalPages = Math.ceil(count / limit);

      return {
        jobs,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalJobs: count,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      logger.error('Failed to fetch user jobs', {
        error: error.message,
        userId
      });
      throw error;
    }
  }
}

module.exports = new JobService();
