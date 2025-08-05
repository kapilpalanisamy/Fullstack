/**
 * Model Index
 * Establishes all database model associations and exports models
 */

// Import all models
const User = require('./User');
const Company = require('./Company');
const Job = require('./Job');
const Application = require('./Application');
const PaymentTransaction = require('./PaymentTransaction');

// Set up associations after all models are loaded
const setupAssociations = () => {
  // User associations
  User.hasMany(Company, { foreignKey: 'created_by', as: 'companies' });
  User.hasMany(Job, { foreignKey: 'created_by', as: 'jobs' });
  User.hasMany(Application, { foreignKey: 'applicant_id', as: 'applications' });
  User.hasMany(PaymentTransaction, { foreignKey: 'user_id', as: 'transactions' });

  // Company associations
  Company.belongsTo(User, { foreignKey: 'created_by', as: 'owner' });
  Company.hasMany(Job, { foreignKey: 'company_id', as: 'jobs' });

  // Job associations
  Job.belongsTo(User, { foreignKey: 'created_by', as: 'recruiter' });
  Job.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
  Job.hasMany(Application, { foreignKey: 'job_id', as: 'applications' });
  Job.hasMany(PaymentTransaction, { foreignKey: 'job_id', as: 'transactions' });

  // Application associations
  Application.belongsTo(User, { foreignKey: 'applicant_id', as: 'applicant' });
  Application.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });

  // PaymentTransaction associations
  PaymentTransaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  PaymentTransaction.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });
};

// Call setup associations
try {
  setupAssociations();
} catch (error) {
  console.warn('Model associations setup skipped:', error.message);
}

module.exports = {
  User,
  Company,
  Job,
  Application,
  PaymentTransaction,
  setupAssociations
};
