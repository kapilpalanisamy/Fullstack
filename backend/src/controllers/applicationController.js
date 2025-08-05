/**
 * Application Controller
 * Handles job application management and operations
 */

const { Application, Job, User, Company } = require('../models');
const logger = require('../config/logger');
const { AppError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

class ApplicationController {
  /**
   * Create new job application
   */
  async createApplication(req, res, next) {
    try {
      const { jobId, coverLetter, resume, expectedSalary } = req.body;

      // Verify job exists and is active
      const job = await Job.findByPk(jobId);
      if (!job) {
        throw new AppError('Job not found', 404);
      }
      
      if (job.status !== 'ACTIVE') {
        throw new AppError('Job is not available for applications', 400);
      }

      // Check if user already applied for this job
      const existingApplication = await Application.findOne({
        where: { jobId, applicantId: req.user.id }
      });

      if (existingApplication) {
        throw new AppError('You have already applied for this job', 400);
      }

      const application = await Application.create({
        jobId,
        applicantId: req.user.id,
        coverLetter,
        resume,
        expectedSalary,
        status: 'PENDING'
      });

      logger.info(`Application created: ${application.id}`, { 
        applicationId: application.id,
        jobId,
        applicantId: req.user.id,
        service: 'application-controller' 
      });

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: application
      });
    } catch (error) {
      logger.error('Error creating application:', error);
      next(error);
    }
  }

  /**
   * Get user's applications
   */
  async getMyApplications(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const status = req.query.status;

      const whereClause = { applicantId: req.user.id };
      if (status) {
        whereClause.status = status;
      }

      const { count, rows: applications } = await Application.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include: [{
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'location', 'type', 'salaryRange'],
          include: [{
            model: Company,
            as: 'company',
            attributes: ['id', 'name', 'logo']
          }]
        }]
      });

      const totalPages = Math.ceil(count / limit);

      res.json({
        success: true,
        data: applications,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: count,
          itemsPerPage: limit
        }
      });
    } catch (error) {
      logger.error('Error retrieving user applications:', error);
      next(error);
    }
  }

  /**
   * Get application by ID
   */
  async getApplicationById(req, res, next) {
    try {
      const { applicationId } = req.params;

      const application = await Application.findByPk(applicationId, {
        include: [{
          model: Job,
          as: 'job',
          include: [{
            model: Company,
            as: 'company',
            attributes: ['id', 'name', 'logo']
          }]
        }, {
          model: User,
          as: 'applicant',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        }]
      });

      if (!application) {
        throw new AppError('Application not found', 404);
      }

      // Check if user can access this application
      if (req.user.id !== application.applicantId && 
          req.user.role !== 'admin' && 
          req.user.id !== application.job.recruiterId) {
        throw new AppError('Access denied', 403);
      }

      res.json({
        success: true,
        data: application
      });
    } catch (error) {
      logger.error('Error retrieving application by ID:', error);
      next(error);
    }
  }

  /**
   * Withdraw application
   */
  async withdrawApplication(req, res, next) {
    try {
      const { applicationId } = req.params;

      const application = await Application.findByPk(applicationId);
      if (!application) {
        throw new AppError('Application not found', 404);
      }

      // Check if user owns this application
      if (application.applicantId !== req.user.id) {
        throw new AppError('Access denied. You can only withdraw your own applications.', 403);
      }

      // Check if application can be withdrawn
      if (application.status === 'ACCEPTED' || application.status === 'REJECTED') {
        throw new AppError('Cannot withdraw application that has been processed', 400);
      }

      await application.destroy();

      logger.info(`Application withdrawn: ${applicationId}`, { 
        applicationId,
        applicantId: req.user.id,
        service: 'application-controller' 
      });

      res.json({
        success: true,
        message: 'Application withdrawn successfully'
      });
    } catch (error) {
      logger.error('Error withdrawing application:', error);
      next(error);
    }
  }

  /**
   * Get applications for a specific job (recruiter/admin only)
   */
  async getJobApplications(req, res, next) {
    try {
      const { jobId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const status = req.query.status;

      // Verify job exists and user has access
      const job = await Job.findByPk(jobId);
      if (!job) {
        throw new AppError('Job not found', 404);
      }

      if (req.user.role !== 'admin' && job.recruiterId !== req.user.id) {
        throw new AppError('Access denied. You can only view applications for your own jobs.', 403);
      }

      const whereClause = { jobId };
      if (status) {
        whereClause.status = status;
      }

      const { count, rows: applications } = await Application.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include: [{
          model: User,
          as: 'applicant',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'skills', 'experience']
        }]
      });

      const totalPages = Math.ceil(count / limit);

      res.json({
        success: true,
        data: applications,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: count,
          itemsPerPage: limit
        }
      });
    } catch (error) {
      logger.error('Error retrieving job applications:', error);
      next(error);
    }
  }

  /**
   * Update application status (recruiter/admin only)
   */
  async updateApplicationStatus(req, res, next) {
    try {
      const { applicationId } = req.params;
      const { status, notes } = req.body;

      const application = await Application.findByPk(applicationId, {
        include: [{
          model: Job,
          as: 'job'
        }]
      });

      if (!application) {
        throw new AppError('Application not found', 404);
      }

      // Check if user has permission to update this application
      if (req.user.role !== 'admin' && application.job.recruiterId !== req.user.id) {
        throw new AppError('Access denied. You can only update applications for your own jobs.', 403);
      }

      const updatedApplication = await application.update({
        status,
        notes,
        reviewedAt: new Date(),
        reviewedBy: req.user.id
      });

      logger.info(`Application status updated: ${applicationId}`, { 
        applicationId,
        newStatus: status,
        reviewedBy: req.user.id,
        service: 'application-controller' 
      });

      res.json({
        success: true,
        message: 'Application status updated successfully',
        data: updatedApplication
      });
    } catch (error) {
      logger.error('Error updating application status:', error);
      next(error);
    }
  }

  /**
   * Get all applications (admin only)
   */
  async getAllApplications(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const status = req.query.status;

      const whereClause = {};
      if (status) {
        whereClause.status = status;
      }

      const { count, rows: applications } = await Application.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include: [{
          model: Job,
          as: 'job',
          attributes: ['id', 'title'],
          include: [{
            model: Company,
            as: 'company',
            attributes: ['id', 'name']
          }]
        }, {
          model: User,
          as: 'applicant',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }]
      });

      const totalPages = Math.ceil(count / limit);

      res.json({
        success: true,
        data: applications,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: count,
          itemsPerPage: limit
        }
      });
    } catch (error) {
      logger.error('Error retrieving all applications:', error);
      next(error);
    }
  }

  /**
   * Get application statistics (admin only)
   */
  async getApplicationStatistics(req, res, next) {
    try {
      const totalApplications = await Application.count();
      const pendingApplications = await Application.count({ where: { status: 'PENDING' } });
      const acceptedApplications = await Application.count({ where: { status: 'ACCEPTED' } });
      const rejectedApplications = await Application.count({ where: { status: 'REJECTED' } });

      const statistics = {
        total: totalApplications,
        pending: pendingApplications,
        accepted: acceptedApplications,
        rejected: rejectedApplications,
        acceptanceRate: totalApplications > 0 ? (acceptedApplications / totalApplications * 100).toFixed(2) : 0
      };

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      logger.error('Error retrieving application statistics:', error);
      next(error);
    }
  }
}

module.exports = new ApplicationController();
