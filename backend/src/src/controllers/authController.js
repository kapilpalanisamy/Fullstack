/**
 * Authentication Controller
 * Handles HTTP requests for authentication
 */

const authService = require('../services/authService');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../config/logger');

class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  register = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    // Basic validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (!['jobseeker', 'recruiter'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either jobseeker or recruiter'
      });
    }

    const result = await authService.register({
      name,
      email,
      password,
      role
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result
    });
  });

  /**
   * Login user
   * POST /api/auth/login
   */
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const result = await authService.login(email, password);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result
    });
  });

  /**
   * Get current user profile
   * GET /api/auth/profile
   */
  getProfile = asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: req.user.toSafeObject()
      }
    });
  });

  /**
   * Update user profile
   * PUT /api/auth/profile
   */
  updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const updateData = req.body;

    const user = await authService.updateProfile(userId, updateData);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  });

  /**
   * Change password
   * PUT /api/auth/change-password
   */
  changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Basic validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const result = await authService.changePassword(
      userId,
      currentPassword,
      newPassword
    );

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      data: result
    });
  });

  /**
   * Logout user
   * POST /api/auth/logout
   */
  logout = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    await authService.logout(userId);

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  });

  /**
   * Refresh JWT token
   * POST /api/auth/refresh
   */
  refreshToken = asyncHandler(async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token is required'
      });
    }

    const result = await authService.refreshToken(token);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: result
    });
  });
}

module.exports = new AuthController();
