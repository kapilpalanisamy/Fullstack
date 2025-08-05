const jobs = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    title: 'Senior Software Engineer',
    description: 'We are looking for a Senior Software Engineer to join our core engineering team. You will work on building scalable distributed systems that serve billions of users worldwide.',
    requirements: JSON.stringify([
      'Bachelor\'s degree in Computer Science or equivalent experience',
      '5+ years of software development experience',
      'Strong proficiency in Java, Python, or Go',
      'Experience with distributed systems and microservices',
      'Knowledge of cloud platforms (GCP, AWS, or Azure)',
      'Experience with containerization and orchestration tools'
    ]),
    responsibilities: JSON.stringify([
      'Design and develop scalable backend services',
      'Collaborate with cross-functional teams',
      'Mentor junior engineers',
      'Participate in code reviews and architectural decisions',
      'Ensure high code quality and system reliability'
    ]),
    salary_min: 150000,
    salary_max: 220000,
    location: 'Mountain View, CA',
    job_type: 'FULL_TIME',
    experience_level: 'SENIOR',
    skills_required: JSON.stringify(['Java', 'Python', 'Go', 'Distributed Systems', 'Microservices', 'Cloud Computing', 'Docker', 'Kubernetes']),
    benefits: JSON.stringify([
      'Competitive salary and equity',
      'Health, dental, and vision insurance',
      'Flexible work arrangements',
      '20 days PTO + holidays',
      'Learning and development budget',
      'Free meals and snacks'
    ]),
    status: 'ACTIVE',
    posted_by: '00000000-0000-4000-8000-000000000002', // Google recruiter
    company_id: '00000000-0000-4000-8000-000000000001', // Google
    application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    title: 'Frontend Developer',
    description: 'Join our frontend team to build beautiful and intuitive user interfaces. You will work with React, TypeScript, and modern web technologies to create amazing user experiences.',
    requirements: JSON.stringify([
      'Bachelor\'s degree in Computer Science or related field',
      '3+ years of frontend development experience',
      'Strong proficiency in React and TypeScript',
      'Experience with state management (Redux, Zustand)',
      'Knowledge of modern CSS frameworks',
      'Understanding of responsive design principles'
    ]),
    responsibilities: JSON.stringify([
      'Develop responsive web applications',
      'Collaborate with designers and backend engineers',
      'Optimize application performance',
      'Write clean, maintainable code',
      'Participate in agile development process'
    ]),
    salary_min: 120000,
    salary_max: 160000,
    location: 'Redmond, WA',
    job_type: 'FULL_TIME',
    experience_level: 'MID',
    skills_required: JSON.stringify(['React', 'TypeScript', 'JavaScript', 'CSS', 'HTML', 'Redux', 'Git', 'Agile']),
    benefits: JSON.stringify([
      'Competitive compensation package',
      'Comprehensive health benefits',
      'Flexible working hours',
      'Professional development opportunities',
      'Stock purchase plan',
      'Wellness programs'
    ]),
    status: 'ACTIVE',
    posted_by: '00000000-0000-4000-8000-000000000003', // Microsoft recruiter
    company_id: '00000000-0000-4000-8000-000000000002', // Microsoft
    application_deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '00000000-0000-4000-8000-000000000003',
    title: 'Data Scientist',
    description: 'We are seeking a talented Data Scientist to join our AI/ML team. You will work on cutting-edge machine learning projects and help drive data-driven decision making across the organization.',
    requirements: JSON.stringify([
      'Master\'s degree in Data Science, Statistics, or related field',
      '4+ years of experience in data science and machine learning',
      'Strong programming skills in Python and R',
      'Experience with ML frameworks (TensorFlow, PyTorch, Scikit-learn)',
      'Knowledge of statistical modeling and hypothesis testing',
      'Experience with big data technologies (Spark, Hadoop)'
    ]),
    responsibilities: JSON.stringify([
      'Develop and deploy machine learning models',
      'Analyze large datasets to extract insights',
      'Collaborate with product and engineering teams',
      'Create data visualizations and reports',
      'Mentor junior data scientists'
    ]),
    salary_min: 140000,
    salary_max: 200000,
    location: 'Menlo Park, CA',
    job_type: 'FULL_TIME',
    experience_level: 'SENIOR',
    skills_required: JSON.stringify(['Python', 'R', 'Machine Learning', 'TensorFlow', 'PyTorch', 'SQL', 'Statistics', 'Big Data']),
    benefits: JSON.stringify([
      'Competitive salary and RSUs',
      'World-class health benefits',
      'Unlimited PTO policy',
      'Learning stipend',
      'Commuter benefits',
      'Fitness and wellness programs'
    ]),
    status: 'ACTIVE',
    posted_by: '00000000-0000-4000-8000-000000000002', // Can be posted by Google recruiter
    company_id: '00000000-0000-4000-8000-000000000003', // Meta
    application_deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 35 days from now
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '00000000-0000-4000-8000-000000000004',
    title: 'DevOps Engineer',
    description: 'Join our infrastructure team to build and maintain scalable, reliable systems. You will work with cloud technologies, automation tools, and help improve our deployment pipelines.',
    requirements: JSON.stringify([
      'Bachelor\'s degree in Computer Science or equivalent experience',
      '3+ years of DevOps or infrastructure experience',
      'Strong experience with AWS or other cloud platforms',
      'Proficiency in infrastructure as code (Terraform, CloudFormation)',
      'Experience with containerization (Docker, Kubernetes)',
      'Knowledge of CI/CD pipelines and automation'
    ]),
    responsibilities: JSON.stringify([
      'Design and maintain cloud infrastructure',
      'Automate deployment and monitoring processes',
      'Ensure system reliability and performance',
      'Collaborate with development teams',
      'Implement security best practices'
    ]),
    salary_min: 130000,
    salary_max: 180000,
    location: 'Seattle, WA',
    job_type: 'FULL_TIME',
    experience_level: 'MID',
    skills_required: JSON.stringify(['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'Python', 'Linux', 'Monitoring']),
    benefits: JSON.stringify([
      'Competitive base salary',
      'Stock options',
      'Health and dental insurance',
      'Flexible work environment',
      'Career development support',
      'Employee discounts'
    ]),
    status: 'ACTIVE',
    posted_by: '00000000-0000-4000-8000-000000000002', // Google recruiter can post for Amazon
    company_id: '00000000-0000-4000-8000-000000000004', // Amazon
    application_deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), // 28 days from now
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '00000000-0000-4000-8000-000000000005',
    title: 'Software Engineering Intern',
    description: 'Summer internship opportunity for students passionate about technology. You will work on real projects alongside experienced engineers and contribute to products used by millions of users.',
    requirements: JSON.stringify([
      'Currently pursuing Bachelor\'s or Master\'s in Computer Science',
      'Strong programming skills in at least one language',
      'Understanding of data structures and algorithms',
      'Previous internship or project experience preferred',
      'Strong problem-solving skills',
      'Excellent communication skills'
    ]),
    responsibilities: JSON.stringify([
      'Work on assigned engineering projects',
      'Collaborate with team members',
      'Participate in code reviews',
      'Attend technical talks and learning sessions',
      'Present final project to team'
    ]),
    salary_min: 8000,
    salary_max: 12000,
    location: 'Los Gatos, CA',
    job_type: 'INTERNSHIP',
    experience_level: 'ENTRY',
    skills_required: JSON.stringify(['Programming', 'Data Structures', 'Algorithms', 'Problem Solving', 'Communication']),
    benefits: JSON.stringify([
      'Competitive hourly rate',
      'Housing stipend',
      'Free meals',
      'Mentorship program',
      'Networking opportunities',
      'Potential for full-time offer'
    ]),
    status: 'ACTIVE',
    posted_by: '00000000-0000-4000-8000-000000000002', // Google recruiter can post for Netflix
    company_id: '00000000-0000-4000-8000-000000000005', // Netflix
    application_deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '00000000-0000-4000-8000-000000000006',
    title: 'Product Manager',
    description: 'Lead product strategy and execution for our core platform. You will work with engineering, design, and business teams to deliver innovative features that delight our users.',
    requirements: JSON.stringify([
      'Bachelor\'s degree in Business, Engineering, or related field',
      '5+ years of product management experience',
      'Strong analytical and strategic thinking skills',
      'Experience with agile development methodologies',
      'Excellent communication and leadership skills',
      'Technical background preferred'
    ]),
    responsibilities: JSON.stringify([
      'Define product roadmap and strategy',
      'Work with engineering teams on feature development',
      'Analyze user data and market trends',
      'Coordinate with stakeholders across the organization',
      'Drive product launches and go-to-market strategies'
    ]),
    salary_min: 160000,
    salary_max: 230000,
    location: 'San Francisco, CA',
    job_type: 'FULL_TIME',
    experience_level: 'SENIOR',
    skills_required: JSON.stringify(['Product Management', 'Strategy', 'Analytics', 'Agile', 'Leadership', 'Communication']),
    benefits: JSON.stringify([
      'Competitive compensation',
      'Equity package',
      'Premium health benefits',
      'Flexible PTO',
      'Learning budget',
      'Commuter benefits'
    ]),
    status: 'ACTIVE',
    posted_by: '00000000-0000-4000-8000-000000000002', // Google recruiter can post for Uber
    company_id: '00000000-0000-4000-8000-000000000006', // Uber
    application_deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
    created_at: new Date(),
    updated_at: new Date()
  }
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('jobs', jobs, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('jobs', null, {});
  }
};
