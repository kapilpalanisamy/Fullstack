/**
 * AI Controller
 * Handles HTTP requests for AI-powered features
 */

const aiService = require('../services/aiService');
const { User, Job } = require('../models');
const logger = require('../config/logger');
const { AppError } = require('../middleware/errorHandler');

class AIController {
  /**
   * Extract skills from job description
   * POST /api/ai/extract-skills
   */
  async extractSkills(req, res, next) {
    try {
      const { jobDescription, jobTitle } = req.body;

      if (!jobDescription) {
        throw new AppError('Job description is required', 400);
      }

      const skills = await aiService.extractSkillsFromJobDescription(jobDescription, jobTitle);

      logger.info('Skills extracted via API', { 
        userId: req.user?.id,
        skillsCount: skills.length 
      });

      res.json({
        success: true,
        data: {
          skills,
          count: skills.length
        }
      });
    } catch (error) {
      logger.error('Error in extract skills endpoint:', error);
      next(error);
    }
  }

  /**
   * Get job recommendations for user
   * GET /api/ai/job-recommendations
   */
  async getJobRecommendations(req, res, next) {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit) || 10;

      // Get user profile with skills
      const user = await User.findByPk(userId, {
        attributes: ['id', 'skills', 'experience', 'location']
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (!user.skills || user.skills.length === 0) {
        return res.json({
          success: true,
          message: 'Please add skills to your profile to get personalized recommendations',
          data: [],
          recommendations: []
        });
      }

      // Get active jobs
      const jobs = await Job.findAll({
        where: { status: 'ACTIVE' },
        limit: 50, // Get more jobs to have better recommendation pool
        order: [['created_at', 'DESC']],
        include: [{
          model: require('../models').Company,
          as: 'company',
          attributes: ['id', 'name', 'logo_url', 'location']
        }]
      });

      // Generate recommendations
      const recommendations = await aiService.generateJobRecommendations(user, jobs);

      logger.info('Job recommendations generated', { 
        userId,
        recommendationsCount: recommendations.length 
      });

      res.json({
        success: true,
        data: recommendations.slice(0, limit),
        meta: {
          totalRecommendations: recommendations.length,
          userSkillsCount: user.skills.length,
          availableJobsCount: jobs.length
        }
      });
    } catch (error) {
      logger.error('Error generating job recommendations:', error);
      next(error);
    }
  }

  /**
   * Calculate match score between user and specific job
   * POST /api/ai/job-match
   */
  async calculateJobMatch(req, res, next) {
    try {
      const { jobId } = req.body;
      const userId = req.user.id;

      if (!jobId) {
        throw new AppError('Job ID is required', 400);
      }

      // Get user skills
      const user = await User.findByPk(userId, {
        attributes: ['id', 'skills']
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Get job with required skills
      const job = await Job.findByPk(jobId, {
        attributes: ['id', 'title', 'skills_required'],
        include: [{
          model: require('../models').Company,
          as: 'company',
          attributes: ['id', 'name']
        }]
      });

      if (!job) {
        throw new AppError('Job not found', 404);
      }

      const matchScore = aiService.calculateJobMatchScore(
        user.skills || [],
        job.skills_required || []
      );

      const matchedSkills = aiService.getMatchedSkills(
        user.skills || [],
        job.skills_required || []
      );

      const missingSkills = aiService.getMissingSkills(
        user.skills || [],
        job.skills_required || []
      );

      logger.info('Job match calculated', { 
        userId,
        jobId,
        matchScore 
      });

      res.json({
        success: true,
        data: {
          matchScore,
          matchedSkills,
          missingSkills,
          job: {
            id: job.id,
            title: job.title,
            company: job.company
          }
        }
      });
    } catch (error) {
      logger.error('Error calculating job match:', error);
      next(error);
    }
  }

  /**
   * Enhance job description using AI
   * POST /api/ai/enhance-job-description
   */
  async enhanceJobDescription(req, res, next) {
    try {
      const { jobDescription, jobTitle, companyName } = req.body;

      if (!jobDescription) {
        throw new AppError('Job description is required', 400);
      }

      // Check if user is recruiter or admin
      if (!['recruiter', 'admin'].includes(req.user.role)) {
        throw new AppError('Access denied. Only recruiters can enhance job descriptions.', 403);
      }

      const enhancedDescription = await aiService.enhanceJobDescription(
        jobDescription,
        jobTitle || 'Position',
        companyName || 'Company'
      );

      logger.info('Job description enhanced', { 
        userId: req.user.id,
        originalLength: jobDescription.length,
        enhancedLength: enhancedDescription.length 
      });

      res.json({
        success: true,
        data: {
          originalDescription: jobDescription,
          enhancedDescription,
          improvement: enhancedDescription !== jobDescription
        }
      });
    } catch (error) {
      logger.error('Error enhancing job description:', error);
      next(error);
    }
  }

  /**
   * Get skill suggestions for user
   * GET /api/ai/skill-suggestions
   */
  async getSkillSuggestions(req, res, next) {
    try {
      const userId = req.user.id;
      const { jobTitle, experienceLevel } = req.query;

      // Get user's current skills
      const user = await User.findByPk(userId, {
        attributes: ['id', 'skills']
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      const suggestions = aiService.getSkillSuggestions(
        user.skills || [],
        jobTitle || '',
        experienceLevel || 'MID'
      );

      logger.info('Skill suggestions generated', { 
        userId,
        suggestionsCount: suggestions.length 
      });

      res.json({
        success: true,
        data: {
          suggestions,
          currentSkills: user.skills || [],
          context: {
            jobTitle: jobTitle || null,
            experienceLevel: experienceLevel || 'MID'
          }
        }
      });
    } catch (error) {
      logger.error('Error generating skill suggestions:', error);
      next(error);
    }
  }

  /**
   * Analyze user profile and provide insights
   * GET /api/ai/profile-analysis
   */
  async analyzeProfile(req, res, next) {
    try {
      const userId = req.user.id;

      // Get user profile
      const user = await User.findByPk(userId, {
        attributes: ['id', 'skills', 'experience', 'location', 'role']
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Get user's job applications to analyze application success
      const { Application } = require('../models');
      const applications = await Application.findAll({
        where: { applicant_id: userId },
        attributes: ['status', 'created_at'],
        limit: 20,
        order: [['created_at', 'DESC']]
      });

      // Calculate profile completeness
      const profileFields = ['skills', 'experience', 'location'];
      const completedFields = profileFields.filter(field => 
        user[field] && (Array.isArray(user[field]) ? user[field].length > 0 : true)
      );
      const profileCompleteness = Math.round((completedFields.length / profileFields.length) * 100);

      // Application success rate
      const totalApplications = applications.length;
      const successfulApplications = applications.filter(app => 
        ['ACCEPTED', 'INTERVIEWED'].includes(app.status)
      ).length;
      const applicationSuccessRate = totalApplications > 0 
        ? Math.round((successfulApplications / totalApplications) * 100) 
        : 0;

      // Skill analysis
      const skillsCount = user.skills ? user.skills.length : 0;
      const skillsAnalysis = {
        count: skillsCount,
        assessment: skillsCount < 5 ? 'Limited' : skillsCount < 10 ? 'Good' : 'Excellent',
        suggestions: skillsCount < 10 ? aiService.getSkillSuggestions(user.skills || []) : []
      };

      const analysis = {
        profileCompleteness,
        applicationSuccessRate,
        skillsAnalysis,
        recommendations: []
      };

      // Generate recommendations
      if (profileCompleteness < 80) {
        analysis.recommendations.push({
          type: 'profile',
          priority: 'high',
          message: 'Complete your profile to increase visibility to recruiters'
        });
      }

      if (skillsCount < 5) {
        analysis.recommendations.push({
          type: 'skills',
          priority: 'high',
          message: 'Add more skills to improve job matching'
        });
      }

      if (applicationSuccessRate < 20 && totalApplications > 3) {
        analysis.recommendations.push({
          type: 'applications',
          priority: 'medium',
          message: 'Consider improving your application approach or targeting different roles'
        });
      }

      logger.info('Profile analysis completed', { 
        userId,
        profileCompleteness,
        skillsCount 
      });

      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      logger.error('Error analyzing profile:', error);
      next(error);
    }
  }
}

module.exports = new AIController();
