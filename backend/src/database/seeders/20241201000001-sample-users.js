/**
 * Seed Sample Users
 */

'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('password123', saltRounds);

    await queryInterface.bulkInsert('users', [
      {
        id: uuidv4(),
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: hashedPassword,
        role: 'jobseeker',
        bio: 'Full-stack developer with 5 years of experience',
        phone: '+1-555-0101',
        location: 'San Francisco, CA',
        skills: JSON.stringify(['JavaScript', 'React', 'Node.js', 'Python']),
        experience_years: 5,
        email_verified: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        password: hashedPassword,
        role: 'recruiter',
        bio: 'Senior Technical Recruiter at TechCorp',
        phone: '+1-555-0102',
        location: 'New York, NY',
        email_verified: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Mike Johnson',
        email: 'mike.johnson@example.com',
        password: hashedPassword,
        role: 'jobseeker',
        bio: 'UI/UX Designer passionate about creating beautiful user experiences',
        phone: '+1-555-0103',
        location: 'Austin, TX',
        skills: JSON.stringify(['Figma', 'Adobe XD', 'Sketch', 'CSS', 'HTML']),
        experience_years: 3,
        email_verified: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Sarah Wilson',
        email: 'sarah.wilson@techcorp.com',
        password: hashedPassword,
        role: 'recruiter',
        bio: 'Lead Recruiter specializing in blockchain and Web3 talent',
        phone: '+1-555-0104',
        location: 'Seattle, WA',
        email_verified: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {});
  }
};
