const bcrypt = require('bcryptjs');

const companies = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    name: 'Google',
    description: 'Google LLC is an American multinational technology company that specializes in Internet-related services and products.',
    website: 'https://google.com',
    location: 'Mountain View, CA',
    industry: 'Technology',
    company_size: '1000+',
    founded_year: 1998,
    logo_url: '/companies/google.webp',
    created_by: '00000000-0000-4000-8000-000000000001', // Will reference first user
    is_verified: true,
    social_links: {},
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '00000000-0000-4000-8000-000000000002', 
    name: 'Microsoft',
    description: 'Microsoft Corporation is an American multinational technology corporation which produces computer software, consumer electronics, personal computers, and related services.',
    website: 'https://microsoft.com',
    location: 'Redmond, WA',
    industry: 'Technology',
    company_size: '1000+',
    founded_year: 1975,
    logo_url: '/companies/microsoft.webp',
    created_by: '00000000-0000-4000-8000-000000000001',
    is_verified: true,
    social_links: {},
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '00000000-0000-4000-8000-000000000003',
    name: 'Meta',
    description: 'Meta Platforms, Inc., doing business as Meta and formerly known as Facebook, Inc., is an American multinational technology conglomerate.',
    website: 'https://meta.com',
    location: 'Menlo Park, CA',
    industry: 'Social Media',
    size: '1000+',
    founded: 2004,
    logo_url: '/companies/meta.svg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '00000000-0000-4000-8000-000000000004',
    name: 'Amazon',
    description: 'Amazon.com, Inc. is an American multinational technology company which focuses on e-commerce, cloud computing, digital streaming, and artificial intelligence.',
    website: 'https://amazon.com',
    location: 'Seattle, WA',
    industry: 'E-commerce',
    size: '1000+',
    founded: 1994,
    logo_url: '/companies/amazon.svg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '00000000-0000-4000-8000-000000000005',
    name: 'Netflix',
    description: 'Netflix, Inc. is an American subscription streaming service and production company.',
    website: 'https://netflix.com',
    location: 'Los Gatos, CA',
    industry: 'Entertainment',
    size: '501-1000',
    founded: 1997,
    logo_url: '/companies/netflix.png',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '00000000-0000-4000-8000-000000000006',
    name: 'Uber',
    description: 'Uber Technologies, Inc., commonly known as Uber, is an American mobility as a service provider.',
    website: 'https://uber.com',
    location: 'San Francisco, CA',
    industry: 'Transportation',
    size: '1000+',
    founded: 2009,
    logo_url: '/companies/uber.svg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '00000000-0000-4000-8000-000000000007',
    name: 'IBM',
    description: 'International Business Machines Corporation (IBM) is an American multinational technology corporation.',
    website: 'https://ibm.com',
    location: 'Armonk, NY',
    industry: 'Technology',
    size: '1000+',
    founded: 1911,
    logo_url: '/companies/ibm.svg',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '00000000-0000-4000-8000-000000000008',
    name: 'Atlassian',
    description: 'Atlassian Corporation Plc is an Australian software company that develops products for software developers, project managers, and other software development teams.',
    website: 'https://atlassian.com',
    location: 'Sydney, Australia',
    industry: 'Software',
    size: '501-1000',
    founded: 2002,
    logo_url: '/companies/atlassian.svg',
    created_at: new Date(),
    updated_at: new Date()
  }
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('companies', companies, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('companies', null, {});
  }
};
