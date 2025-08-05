const bcrypt = require('bcryptjs');

const users = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    email: 'admin@rizeportal.com',
    password: bcrypt.hashSync('admin123!@#', 10),
    full_name: 'RizeOS Admin',
    role: 'admin',
    is_email_verified: true,
    profile: JSON.stringify({
      bio: 'System Administrator for RizeOS Job Portal',
      location: 'Remote',
      experience_years: 10,
      skills: ['System Administration', 'User Management', 'Database Management']
    }),
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    email: 'recruiter@google.com',
    password: bcrypt.hashSync('recruiter123', 10),
    full_name: 'Sarah Johnson',
    role: 'recruiter',
    is_email_verified: true,
    company_id: '00000000-0000-4000-8000-000000000001', // Google
    profile: JSON.stringify({
      bio: 'Senior Technical Recruiter at Google',
      location: 'Mountain View, CA',
      experience_years: 8,
      skills: ['Technical Recruiting', 'Talent Acquisition', 'Interview Process']
    }),
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '00000000-0000-4000-8000-000000000003',
    email: 'recruiter@microsoft.com',
    password: bcrypt.hashSync('recruiter123', 10),
    full_name: 'Michael Chen',
    role: 'recruiter',
    is_email_verified: true,
    company_id: '00000000-0000-4000-8000-000000000002', // Microsoft
    profile: JSON.stringify({
      bio: 'Principal Talent Acquisition Partner at Microsoft',
      location: 'Redmond, WA',
      experience_years: 12,
      skills: ['Executive Recruiting', 'Engineering Talent', 'Global Hiring']
    }),
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '00000000-0000-4000-8000-000000000004',
    email: 'jobseeker1@example.com',
    password: bcrypt.hashSync('jobseeker123', 10),
    full_name: 'Alex Rodriguez',
    role: 'jobseeker',
    is_email_verified: true,
    profile: JSON.stringify({
      bio: 'Full Stack Developer with 5 years experience in React and Node.js',
      location: 'San Francisco, CA',
      experience_years: 5,
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'PostgreSQL', 'MongoDB'],
      education: 'B.S. Computer Science - UC Berkeley',
      resume_url: null
    }),
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '00000000-0000-4000-8000-000000000005',
    email: 'jobseeker2@example.com',
    password: bcrypt.hashSync('jobseeker123', 10),
    full_name: 'Emma Thompson',
    role: 'jobseeker',
    is_email_verified: true,
    profile: JSON.stringify({
      bio: 'Data Scientist specializing in Machine Learning and AI',
      location: 'New York, NY',
      experience_years: 3,
      skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'R', 'Statistics'],
      education: 'M.S. Data Science - NYU',
      resume_url: null
    }),
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '00000000-0000-4000-8000-000000000006',
    email: 'jobseeker3@example.com',
    password: bcrypt.hashSync('jobseeker123', 10),
    full_name: 'David Kim',
    role: 'jobseeker',
    is_email_verified: true,
    profile: JSON.stringify({
      bio: 'DevOps Engineer with expertise in cloud infrastructure and automation',
      location: 'Austin, TX',
      experience_years: 7,
      skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'Python', 'Bash'],
      education: 'B.S. Computer Engineering - UT Austin',
      resume_url: null
    }),
    created_at: new Date(),
    updated_at: new Date()
  }
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('users', users, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {});
  }
};
