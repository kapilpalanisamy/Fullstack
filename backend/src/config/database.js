/**
 * Database Configuration
 * Fixed PostgreSQL connection with proper SSL configuration for existing Supabase schema
 */

// Import the main database service
const databaseService = require('../services/databaseService');

// Export all database service functions for backward compatibility
module.exports = databaseService;
