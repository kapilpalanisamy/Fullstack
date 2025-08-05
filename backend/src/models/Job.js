/**
 * Job Model
 * Database model for job postings
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Job = sequelize.define('Job', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 200]
    }
  },
  
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  
  requirements: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  type: {
    type: DataTypes.ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'REMOTE'),
    allowNull: false,
    defaultValue: 'FULL_TIME'
  },
  
  experience_level: {
    type: DataTypes.ENUM('ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE'),
    allowNull: false,
    defaultValue: 'MID'
  },
  
  salary_min: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  
  salary_max: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  
  salary_currency: {
    type: DataTypes.STRING(3),
    allowNull: true,
    defaultValue: 'USD'
  },
  
  skills_required: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  
  benefits: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  
  status: {
    type: DataTypes.ENUM('DRAFT', 'ACTIVE', 'PAUSED', 'CLOSED', 'EXPIRED'),
    allowNull: false,
    defaultValue: 'DRAFT'
  },
  
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  is_premium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  application_deadline: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  external_application_url: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  
  view_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  
  application_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  
  // Foreign Keys
  company_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'companies',
      key: 'id'
    }
  },
  
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'jobs',
  timestamps: true,
  underscored: true,
  
  // Add computed field for salary range
  getterMethods: {
    salaryRange() {
      if (this.salary_min && this.salary_max) {
        return `${this.salary_currency} ${this.salary_min} - ${this.salary_max}`;
      } else if (this.salary_min) {
        return `${this.salary_currency} ${this.salary_min}+`;
      } else if (this.salary_max) {
        return `Up to ${this.salary_currency} ${this.salary_max}`;
      }
      return 'Salary not specified';
    }
  },
  
  // Indexes for better performance
  indexes: [
    {
      fields: ['status']
    },
    {
      fields: ['company_id']
    },
    {
      fields: ['created_by']
    },
    {
      fields: ['type']
    },
    {
      fields: ['experience_level']
    },
    {
      fields: ['location']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = Job;
