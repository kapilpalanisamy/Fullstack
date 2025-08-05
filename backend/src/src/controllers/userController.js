/**
 * User Controller
 * Handles user profile management and user operations
 */

const { User } = require('../models');
const logger = require('../config/logger');
const { AppError } = require('../middleware/errorHandler');

class UserController {
  /**
   * Get current user profile
   */
  async getProfile(req, res, next) {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      logger.info(`User profile retrieved: ${user.id}`, { 
        userId: user.id,
        service: 'user-controller' 
      });

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      logger.error('Error retrieving user profile:', error);
      next(error);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req, res, next) {
    try {
      const { firstName, lastName, phone, skills, experience, location } = req.body;
      
      const user = await User.findByPk(req.user.id);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const updatedUser = await user.update({
        firstName,
        lastName,
        phone,
        skills,
        experience,
        location
      });

      logger.info(`User profile updated: ${user.id}`, { 
        userId: user.id,
        service: 'user-controller' 
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          role: updatedUser.role,
          phone: updatedUser.phone,
          skills: updatedUser.skills,
          experience: updatedUser.experience,
          location: updatedUser.location
        }
      });
    } catch (error) {
      logger.error('Error updating user profile:', error);
      next(error);
    }
  }

  /**
   * Delete user profile
   */
  async deleteProfile(req, res, next) {
    try {
      const user = await User.findByPk(req.user.id);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      await user.destroy();

      logger.info(`User profile deleted: ${req.user.id}`, { 
        userId: req.user.id,
        service: 'user-controller' 
      });

      res.json({
        success: true,
        message: 'Profile deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting user profile:', error);
      next(error);
    }
  }

  /**
   * Get user by ID (for admin or public view)
   */
  async getUserById(req, res, next) {
    try {
      const { userId } = req.params;
      
      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      logger.error('Error retrieving user by ID:', error);
      next(error);
    }
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const { count, rows: users } = await User.findAndCountAll({
        attributes: { exclude: ['password'] },
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      const totalPages = Math.ceil(count / limit);

      res.json({
        success: true,
        data: users,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: count,
          itemsPerPage: limit
        }
      });
    } catch (error) {
      logger.error('Error retrieving all users:', error);
      next(error);
    }
  }

  /**
   * Update user status (admin only)
   */
  async updateUserStatus(req, res, next) {
    try {
      const { userId } = req.params;
      const { status } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      await user.update({ status });

      logger.info(`User status updated: ${userId}`, { 
        userId,
        newStatus: status,
        adminId: req.user.id,
        service: 'user-controller' 
      });

      res.json({
        success: true,
        message: 'User status updated successfully',
        data: { id: user.id, status: user.status }
      });
    } catch (error) {
      logger.error('Error updating user status:', error);
      next(error);
    }
  }
}

module.exports = new UserController();
