/**
 * Create Jobs Table Migration
 */

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('jobs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'companies',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      location: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      job_type: {
        type: Sequelize.ENUM('full-time', 'part-time', 'contract', 'internship', 'freelance'),
        allowNull: false
      },
      experience_level: {
        type: Sequelize.ENUM('entry', 'mid', 'senior', 'executive'),
        allowNull: true
      },
      salary_min: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      salary_max: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      salary_currency: {
        type: Sequelize.STRING(10),
        allowNull: true,
        defaultValue: 'USD'
      },
      required_skills: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: []
      },
      benefits: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: []
      },
      requirements: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      responsibilities: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      application_deadline: {
        type: Sequelize.DATE,
        allowNull: true
      },
      is_remote: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      is_featured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      view_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      application_count: {
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
    await queryInterface.addIndex('jobs', ['title']);
    await queryInterface.addIndex('jobs', ['company_id']);
    await queryInterface.addIndex('jobs', ['created_by']);
    await queryInterface.addIndex('jobs', ['location']);
    await queryInterface.addIndex('jobs', ['job_type']);
    await queryInterface.addIndex('jobs', ['experience_level']);
    await queryInterface.addIndex('jobs', ['is_active']);
    await queryInterface.addIndex('jobs', ['is_featured']);
    await queryInterface.addIndex('jobs', ['created_at']);
    await queryInterface.addIndex('jobs', ['application_deadline']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('jobs');
  }
};
