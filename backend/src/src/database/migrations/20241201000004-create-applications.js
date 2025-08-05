/**
 * Create Applications Table Migration
 */

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('applications', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      job_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'jobs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('pending', 'reviewed', 'accepted', 'rejected', 'withdrawn'),
        allowNull: false,
        defaultValue: 'pending'
      },
      cover_letter: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      resume_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      portfolio_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      expected_salary: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      availability_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      additional_info: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {}
      },
      reviewed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      reviewed_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      feedback: {
        type: Sequelize.TEXT,
        allowNull: true
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
    await queryInterface.addIndex('applications', ['user_id']);
    await queryInterface.addIndex('applications', ['job_id']);
    await queryInterface.addIndex('applications', ['status']);
    await queryInterface.addIndex('applications', ['created_at']);
    await queryInterface.addIndex('applications', ['user_id', 'job_id'], { unique: true });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('applications');
  }
};
