/**
 * Authentication Service
 * Business logic for user authentication
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../config/logger');
const config = require('../config/config');

class AuthService {
  /**
   * Register a new user
   */
  async register(userData) {
    try {
      const { name, email, password, role } = userData;

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new AppError('User already exists with this email', 409);
      }

      // Create new user
      const user = await User.create({
        name,
        email,
        password, // Will be hashed by the model hook
        role
      });

      // Generate JWT token
      const token = user.generateAuthToken();

      logger.info('User registered successfully', { 
        userId: user.id, 
        email: user.email 
      });

      return {
        user: user.toSafeObject(),
        token
      };
    } catch (error) {
      logger.error('Registration failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(email, password) {
    try {
      // Find user by email
      const user = await User.findOne({ where: { email } });
      if (!user) {
        throw new AppError('Invalid credentials', 401);
      }

      // Check password
      const isPasswordValid = await user.validatePassword(password);
      if (!isPasswordValid) {
        throw new AppError('Invalid credentials', 401);
      }

      // Update last login
      await user.update({ 
        last_login: new Date(),
        login_count: user.login_count + 1 
      });

      // Generate JWT token
      const token = user.generateAuthToken();

      logger.info('User logged in successfully', { 
        userId: user.id, 
        email: user.email 
      });

      return {
        user: user.toSafeObject(),
        token
      };
    } catch (error) {
      logger.error('Login failed', { 
        email, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Verify JWT token
   */
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await User.findByPk(decoded.id);
      
      if (!user) {
        throw new AppError('User not found', 404);
      }

      return user;
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new AppError('Invalid token', 401);
      }
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Token expired', 401);
      }
      throw error;
    }
  }

  /**
   * Logout user (invalidate token)
   */
  async logout(userId) {
    try {
      // Update user logout time
      await User.update(
        { last_logout: new Date() },
        { where: { id: userId } }
      );

      logger.info('User logged out successfully', { userId });
    } catch (error) {
      logger.error('Logout failed', { userId, error: error.message });
      throw error;
    }
  }

  /**
   * Refresh JWT token
   */
  async refreshToken(token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await User.findByPk(decoded.id);
      
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const newToken = user.generateAuthToken();

      logger.info('Token refreshed successfully', { userId: user.id });

      return {
        user: user.toSafeObject(),
        token: newToken
      };
    } catch (error) {
      logger.error('Token refresh failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, updateData) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Remove sensitive fields that shouldn't be updated here
      const { password, email, role, ...safeUpdateData } = updateData;

      await user.update(safeUpdateData);

      logger.info('Profile updated successfully', { userId });

      return user.toSafeObject();
    } catch (error) {
      logger.error('Profile update failed', { 
        userId, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Verify current password
      const isCurrentPasswordValid = await user.validatePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        throw new AppError('Current password is incorrect', 400);
      }

      // Update password
      await user.update({ password: newPassword });

      logger.info('Password changed successfully', { userId });

      return { message: 'Password updated successfully' };
    } catch (error) {
      logger.error('Password change failed', { 
        userId, 
        error: error.message 
      });
      throw error;
    }
  }
}

module.exports = new AuthService();
