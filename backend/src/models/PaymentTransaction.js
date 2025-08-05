/**
 * PaymentTransaction Model
 * Database model for blockchain payment transactions
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PaymentTransaction = sequelize.define('PaymentTransaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  transaction_hash: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  from_wallet: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [32, 50] // Solana wallet address length
    }
  },
  to_wallet: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [32, 50] // Solana wallet address length
    }
  },
  amount: {
    type: DataTypes.DECIMAL(18, 9), // Supports SOL with 9 decimal places
    allowNull: false,
    validate: {
      min: 0
    }
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'SOL'
  },
  transaction_type: {
    type: DataTypes.ENUM('job_posting', 'premium_feature', 'application_fee', 'refund'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'failed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending'
  },
  block_number: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  confirmation_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  gas_fee: {
    type: DataTypes.DECIMAL(18, 9),
    allowNull: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  job_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'jobs',
      key: 'id'
    }
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
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
  tableName: 'payment_transactions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['transaction_hash']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['job_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['transaction_type']
    }
  ]
});

module.exports = PaymentTransaction;
