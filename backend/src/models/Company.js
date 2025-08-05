/**
 * Company Model
 * Company entity for job postings
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Company = sequelize.define('Company', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [2, 100]
    }
  },
  
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  website: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  
  logo_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  industry: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  company_size: {
    type: DataTypes.ENUM('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'),
    allowNull: true
  },
  
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  founded_year: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1800,
      max: new Date().getFullYear()
    }
  },
  
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  // Foreign Keys
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'companies',
  timestamps: true,
  underscored: true
});

module.exports = Company;
