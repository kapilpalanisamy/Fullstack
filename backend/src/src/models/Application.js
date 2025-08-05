/**
 * Application Model
 * Database model for job applications
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Application = sequelize.define('Application', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  cover_letter: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  resume_url: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  
  expected_salary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  
  status: {
    type: DataTypes.ENUM('PENDING', 'REVIEWED', 'INTERVIEWED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'),
    allowNull: false,
    defaultValue: 'PENDING'
  },
  
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  reviewed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  reviewed_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  
  interview_scheduled_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // Foreign Keys
  job_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'jobs',
      key: 'id'
    }
  },
  
  applicant_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'applications',
  timestamps: true,
  underscored: true,
  
  // Prevent duplicate applications for the same job
  indexes: [
    {
      unique: true,
      fields: ['job_id', 'applicant_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['applicant_id']
    },
    {
      fields: ['job_id']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = Application;
