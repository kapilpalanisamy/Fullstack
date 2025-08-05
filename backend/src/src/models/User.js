/**
 * User Model
 * Database model for user authentication and profiles
 */

const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');
const config = require('../config/config');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 128]
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 100]
    }
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  linkedin_url: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  wallet_address: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  skills: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  profile_image_url: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  role: {
    type: DataTypes.ENUM('jobseeker', 'recruiter', 'admin'),
    defaultValue: 'jobseeker',
    allowNull: false
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verification_token: {
    type: DataTypes.STRING,
    allowNull: true
  },
  password_reset_token: {
    type: DataTypes.STRING,
    allowNull: true
  },
  password_reset_expires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  experience_years: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0,
      max: 50
    }
  },
  salary_expectation: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  preferred_job_type: {
    type: DataTypes.ENUM('full-time', 'part-time', 'contract', 'freelance'),
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  
  hooks: {
    beforeCreate: async (user) => {
      if (user.password_hash) {
        user.password_hash = await bcrypt.hash(user.password_hash, config.security.bcryptSaltRounds);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password_hash')) {
        user.password_hash = await bcrypt.hash(user.password_hash, config.security.bcryptSaltRounds);
      }
    }
  }
});

// Instance methods
User.prototype.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password_hash);
};

User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.password_hash;
  delete values.verification_token;
  delete values.password_reset_token;
  delete values.password_reset_expires;
  return values;
};

User.prototype.generateVerificationToken = function() {
  const crypto = require('crypto');
  this.verification_token = crypto.randomBytes(32).toString('hex');
  return this.verification_token;
};

User.prototype.generatePasswordResetToken = function() {
  const crypto = require('crypto');
  this.password_reset_token = crypto.randomBytes(32).toString('hex');
  this.password_reset_expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return this.password_reset_token;
};

// Static methods
User.findByEmail = function(email) {
  return this.findOne({ where: { email: email.toLowerCase() } });
};

User.findByWalletAddress = function(walletAddress) {
  return this.findOne({ where: { wallet_address: walletAddress } });
};

module.exports = User;
