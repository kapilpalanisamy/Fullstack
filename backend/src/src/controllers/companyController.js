/**
 * Company Controller
 * Handles company management and operations
 */

const { Company, Job, User } = require('../models');
const logger = require('../config/logger');
const { AppError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

class CompanyController {
  /**
   * Get all companies (public)
   */
  async getCompanies(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const search = req.query.search;

      const whereClause = search ? {
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { industry: { [Op.iLike]: `%${search}%` } },
          { location: { [Op.iLike]: `%${search}%` } }
        ]
      } : {};

      const { count, rows: companies } = await Company.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include: [{
          model: Job,
          as: 'jobs',
          attributes: ['id', 'title', 'status'],
          required: false
        }]
      });

      const totalPages = Math.ceil(count / limit);

      res.json({
        success: true,
        data: companies,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: count,
          itemsPerPage: limit
        }
      });
    } catch (error) {
      logger.error('Error retrieving companies:', error);
      next(error);
    }
  }

  /**
   * Get company by ID (public)
   */
  async getCompanyById(req, res, next) {
    try {
      const { companyId } = req.params;

      const company = await Company.findByPk(companyId, {
        include: [{
          model: Job,
          as: 'jobs',
          where: { status: 'ACTIVE' },
          required: false,
          attributes: ['id', 'title', 'location', 'type', 'salaryRange', 'createdAt']
        }]
      });

      if (!company) {
        throw new AppError('Company not found', 404);
      }

      res.json({
        success: true,
        data: company
      });
    } catch (error) {
      logger.error('Error retrieving company by ID:', error);
      next(error);
    }
  }

  /**
   * Create new company (recruiters only)
   */
  async createCompany(req, res, next) {
    try {
      const { name, description, website, industry, company_size, location, logo_url } = req.body;

      // Check if company with same name already exists
      const existingCompany = await Company.findOne({ where: { name } });
      if (existingCompany) {
        throw new AppError('Company with this name already exists', 400);
      }

      const company = await Company.create({
        name,
        description,
        website,
        industry,
        company_size,
        location,
        logo_url,
        created_by: req.user.id
      });

      logger.info(`Company created: ${company.id}`, { 
        companyId: company.id,
        created_by: req.user.id,
        service: 'company-controller' 
      });

      res.status(201).json({
        success: true,
        message: 'Company created successfully',
        data: company
      });
    } catch (error) {
      logger.error('Error creating company:', error);
      next(error);
    }
  }

  /**
   * Update company (owner or admin only)
   */
  async updateCompany(req, res, next) {
    try {
      const { companyId } = req.params;
      const { name, description, website, industry, company_size, location } = req.body;

      const company = await Company.findByPk(companyId);
      if (!company) {
        throw new AppError('Company not found', 404);
      }

      // Check ownership (unless admin)
      if (req.user.role !== 'admin' && company.created_by !== req.user.id) {
        throw new AppError('Access denied. You can only update your own company.', 403);
      }

      // Check if new name conflicts with existing company
      if (name && name !== company.name) {
        const existingCompany = await Company.findOne({ 
          where: { 
            name,
            id: { [Op.ne]: companyId }
          } 
        });
        if (existingCompany) {
          throw new AppError('Company with this name already exists', 400);
        }
      }

      const updatedCompany = await company.update({
        name,
        description,
        website,
        industry,
        company_size,
        location
      });

      logger.info(`Company updated: ${companyId}`, { 
        companyId,
        updatedBy: req.user.id,
        service: 'company-controller' 
      });

      res.json({
        success: true,
        message: 'Company updated successfully',
        data: updatedCompany
      });
    } catch (error) {
      logger.error('Error updating company:', error);
      next(error);
    }
  }

  /**
   * Delete company (owner or admin only)
   */
  async deleteCompany(req, res, next) {
    try {
      const { companyId } = req.params;

      const company = await Company.findByPk(companyId);
      if (!company) {
        throw new AppError('Company not found', 404);
      }

      // Check ownership (unless admin)
      if (req.user.role !== 'admin' && company.ownerId !== req.user.id) {
        throw new AppError('Access denied. You can only delete your own company.', 403);
      }

      await company.destroy();

      logger.info(`Company deleted: ${companyId}`, { 
        companyId,
        deletedBy: req.user.id,
        service: 'company-controller' 
      });

      res.json({
        success: true,
        message: 'Company deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting company:', error);
      next(error);
    }
  }

  /**
   * Get company jobs
   */
  async getCompanyJobs(req, res, next) {
    try {
      const { companyId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const company = await Company.findByPk(companyId);
      if (!company) {
        throw new AppError('Company not found', 404);
      }

      const { count, rows: jobs } = await Job.findAndCountAll({
        where: { companyId },
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      const totalPages = Math.ceil(count / limit);

      res.json({
        success: true,
        data: jobs,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: count,
          itemsPerPage: limit
        }
      });
    } catch (error) {
      logger.error('Error retrieving company jobs:', error);
      next(error);
    }
  }

  /**
   * Get all companies for admin
   */
  async getAllCompanies(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const { count, rows: companies } = await Company.findAndCountAll({
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include: [{
          model: User,
          as: 'owner',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }, {
          model: Job,
          as: 'jobs',
          attributes: ['id', 'title', 'status']
        }]
      });

      const totalPages = Math.ceil(count / limit);

      res.json({
        success: true,
        data: companies,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: count,
          itemsPerPage: limit
        }
      });
    } catch (error) {
      logger.error('Error retrieving all companies for admin:', error);
      next(error);
    }
  }
}

module.exports = new CompanyController();
