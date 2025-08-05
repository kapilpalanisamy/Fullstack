/**
 * Create Payment Transactions Table Migration
 */

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('payment_transactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      transaction_hash: {
        type: Sequelize.STRING(200),
        allowNull: false,
        unique: true
      },
      from_wallet: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      to_wallet: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(18, 9),
        allowNull: false
      },
      currency: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: 'SOL'
      },
      transaction_type: {
        type: Sequelize.ENUM('job_posting', 'premium_feature', 'application_fee', 'refund'),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'confirmed', 'failed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
      },
      block_number: {
        type: Sequelize.BIGINT,
        allowNull: true
      },
      confirmation_count: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      gas_fee: {
        type: Sequelize.DECIMAL(18, 9),
        allowNull: true
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
        allowNull: true,
        references: {
          model: 'jobs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {}
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
    await queryInterface.addIndex('payment_transactions', ['transaction_hash']);
    await queryInterface.addIndex('payment_transactions', ['user_id']);
    await queryInterface.addIndex('payment_transactions', ['job_id']);
    await queryInterface.addIndex('payment_transactions', ['status']);
    await queryInterface.addIndex('payment_transactions', ['transaction_type']);
    await queryInterface.addIndex('payment_transactions', ['created_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('payment_transactions');
  }
};
