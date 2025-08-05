/**
 * Create Users Table Migration
 */

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('jobseeker', 'recruiter', 'admin'),
        allowNull: false,
        defaultValue: 'jobseeker'
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      avatar_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      location: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      website: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      linkedin_url: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      github_url: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      skills: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: []
      },
      experience_years: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      resume_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      wallet_address: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      email_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      last_login: {
        type: Sequelize.DATE,
        allowNull: true
      },
      last_logout: {
        type: Sequelize.DATE,
        allowNull: true
      },
      login_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes
    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['role']);
    await queryInterface.addIndex('users', ['wallet_address']);
    await queryInterface.addIndex('users', ['created_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};
