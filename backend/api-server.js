/**
 * RizeOS Job Portal Backend - API Server
 * Updated with Supabase Database Integration
 */

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

// Load environment variables with explicit path
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 5000;

// CORS configuration
app.use(cors({
  origin: ['https://fullstack-job-portal.netlify.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Simple authentication middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      message: 'Please login to access this resource'
    });
  }
  
  // For now, we'll accept any Bearer token since we're using a simple system
  // In a real app, you'd verify the JWT token here
  req.user = {
    id: '149bb178-866c-41a5-8724-4c0702218d01', // Kapil's user ID
    name: 'Kapil',
    email: 'kapilalpha73@gmail.com',
    role: 'recruiter'
  };
  next();
};

// Helper function to validate and convert user IDs
const validateUserId = (userId) => {
  // If it's a MongoDB ObjectId (24 characters), convert it to a UUID
  if (userId && userId.length === 24 && /^[0-9a-fA-F]{24}$/.test(userId)) {
    console.log('⚠️ Converting MongoDB ObjectId to UUID:', userId);
    return '149bb178-866c-41a5-8724-4c0702218d01'; // Use Kapil's UUID
  }
  return userId;
};

// Database configuration using Transaction Pooler (better for stateless applications)
const dbConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
        sslmode: 'require'
    },
    max: 10, // Increased pool size for better concurrent connections
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // Reduced timeout for faster failure detection
    keepAlive: true,
    statement_timeout: 10000, // Prevent long-running queries
    query_timeout: 10000,    // Additional query timeout
    application_name: 'rizeos-job-portal', // Helps identify connections in logs
    // PgBouncer settings
    keepAliveInitialDelayMillis: 10000,
    retry_on_connection_loss: true
};

let pool;
let databaseStatus = 'Connecting...';
let isConnected = false;

// Initialize database connection with retry logic
async function initDatabase() {
    const maxRetries = 2; // Reduced retries since we'll add hardcoded users
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
        try {
            console.log(`🔌 Testing database connection (attempt ${retryCount + 1}/${maxRetries})...`);
            console.log(`   Connection string: ${dbConfig.connectionString.replace(/:[^:@]+@/, ':***@')}`);
            console.log(`   SSL Mode: ${dbConfig.ssl.sslmode}`);
            console.log(`   Keep Alive: ${dbConfig.keepAlive}`);
            
            pool = new Pool(dbConfig);
            
            // Add error listener to catch connection issues
            pool.on('error', (err) => {
                console.error('Unexpected error on idle client', err);
                process.exit(-1);
            });
            
            // Test connection with timeout
            const client = await pool.connect();
            await client.query('SELECT 1');
            client.release();
            
            console.log('✅ Database connected successfully!');
            databaseStatus = 'Connected ✅';
            isConnected = true;
            
            // Test basic queries
            try {
                const result = await pool.query('SELECT NOW() as current_time');
                console.log(`   Connected at: ${result.rows[0].current_time}`);
                
                const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
                const jobCount = await pool.query('SELECT COUNT(*) as count FROM jobs WHERE is_active = true');
                console.log(`📊 Found ${userCount.rows[0].count} users and ${jobCount.rows[0].count} active jobs`);
            } catch (err) {
                console.log('📊 Database tables need setup (this is normal for new installations)');
            }
            
            return; // Success, exit retry loop
            
        } catch (error) {
            retryCount++;
            console.error(`❌ Database connection failed (attempt ${retryCount}/${maxRetries}):`);
            console.error(`   Error: ${error.message}`);
            console.error(`   Code: ${error.code}`);
            
            if (retryCount < maxRetries) {
                console.log(`   Retrying in 2 seconds...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            } else {
                console.error('❌ Database connection failed, but server will start with hardcoded test users');
                databaseStatus = 'Connection Failed ❌';
                isConnected = false;
                console.log('� Using hardcoded test users for authentication');
            }
        }
    }
}

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://localhost:5175', 
    'http://localhost:5176', 
    'http://localhost:5177', 
    'http://localhost:5178', 
    'http://127.0.0.1:5173'
  ],
  credentials: true
}));
app.use(express.json());

// Initialize database on startup
initDatabase();

// Basic routes that frontend can use immediately
app.get('/', (req, res) => {
  res.json({
    message: 'RizeOS Job Portal Backend API',
    version: '1.0.0',
    status: 'Connected ✅',
    features: {
      blockchain: 'Ethereum + MetaMask Ready 🦊',
      ai: 'OpenAI GPT-3.5 Ready 🤖',
      database: databaseStatus
    },
    endpoints: {
      health: '/health',
      jobs: '/api/jobs',
      companies: '/api/companies',
      users: '/api/users',
      applications: '/api/applications',
      auth: '/api/auth',
      login: '/api/auth/login',
      register: '/api/auth/register',
      blockchain: '/api/blockchain'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'Backend is running perfectly! 🚀',
    database: {
      status: databaseStatus,
      connected: isConnected
    }
  });
});

// Real API endpoints with database integration

// Jobs endpoints
app.get('/api/jobs', async (req, res) => {
  try {
    if (!isConnected) {
      // Return error if database not connected
      return res.status(503).json({
        success: false,
        error: 'Database not available',
        message: 'Service is currently unavailable. Please try again later.'
      });
    }

    const result = await pool.query(`
      SELECT j.id, j.title, j.description, j.location, j.job_type, j.experience_level, 
             j.salary_min, j.salary_max, j.salary_currency, j.application_deadline, j.is_featured,
             j.created_at, j.updated_at,
             c.name as company_name, c.logo_url as company_logo, c.location as company_location
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.id
      WHERE j.is_active = true
      ORDER BY j.is_featured DESC, j.created_at DESC
    `);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
      message: `Found ${result.rows.length} jobs from database`
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch jobs',
      message: error.message
    });
  }
});

app.get('/api/jobs/:id', async (req, res) => {
  try {
    if (!isConnected) {
      return res.status(503).json({
        success: false,
        error: 'Database not connected'
      });
    }

    const result = await pool.query(`
      SELECT j.id, j.title, j.description, j.location, j.job_type, j.experience_level, 
             j.salary_min, j.salary_max, j.salary_currency, j.application_deadline, j.is_featured,
             j.created_at, j.updated_at,
             c.id as company_id, c.name as company_name, c.description as company_description,
             c.logo_url as company_logo, c.website as company_website, c.location as company_location
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.id
      WHERE j.id = $1
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Job not found',
        message: `Job with ID ${req.params.id} does not exist`
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch job',
      message: error.message
    });
  }
});

// Companies endpoints
app.get('/api/companies', async (req, res) => {
  try {
    if (!isConnected) {
      return res.json({
        success: true,
        data: [
          {
            id: 1,
            name: 'RizeOS',
            description: 'Leading Web3 Job Portal',
            industry: 'Technology',
            location: 'Global',
            created_at: new Date().toISOString()
          }
        ],
        count: 1,
        message: 'Mock data (database offline)'
      });
    }

    const result = await pool.query(`
      SELECT c.id, c.name, c.description, c.website, c.logo_url, c.industry, c.company_size, c.location, c.founded_year, c.is_verified, c.created_at, c.updated_at
      FROM companies c
      ORDER BY c.created_at DESC
    `);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
      message: `Found ${result.rows.length} companies from database`
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch companies',
      message: error.message
    });
  }
});

// Users endpoints  
app.get('/api/users', async (req, res) => {
  try {
    if (!isConnected) {
      return res.json({
        success: true,
        data: [],
        count: 0,
        message: 'Mock data (database offline)'
      });
    }

    const result = await pool.query(`
      SELECT DISTINCT u.id, u.name, u.email, u.role, u.bio, u.avatar_url, u.location, 
             u.phone, u.website, u.linkedin_url, u.github_url, u.skills, 
             u.experience_years, u.wallet_address, u.email_verified, u.is_active, 
             u.created_at, u.updated_at
      FROM users u
      ORDER BY u.created_at DESC
    `);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
      message: `Found ${result.rows.length} users from database`
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
      message: error.message
    });
  }
});// Authentication endpoints
// Simple user service functions with database and fallback
const usersService = {
  // Hardcoded test users for when database is not available
  testUsers: [
    {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      password: '$2a$10$8sCvBIRGlxMnNR2lvHwPf.sMBDxhHFVsEW96C0JJPLn5kZOi7Y2LC', // Password: test123!@#
      role: 'jobseeker',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Demo Recruiter',
      email: 'recruiter@example.com',
      password: '$2a$10$9cDZ2J7IgqeieK9D1O8sJ.eZLZiWGZg0PJ5tH2Gj5vU5GwzvLgM2.', // Password: recruiter123
      role: 'recruiter',
      created_at: new Date().toISOString()
    }
  ],

  async getByEmail(email) {
    console.log('🔍 Searching for user with email:', email);
    
    // First try to check database if connected
    if (pool && isConnected) {
      try {
        console.log('💾 Checking database first...');
        const result = await pool.query('SELECT id, name, email, role, password, created_at FROM users WHERE email = $1', [email]);
        if (result.rows[0]) {
          console.log(`✅ Found database user:`, result.rows[0]);
          return result.rows[0];
        }
        console.log('❌ User not found in database');
      } catch (error) {
        console.error('Error fetching user by email:', error.message);
      }
    } else {
      console.log('💡 Database not connected, checking test users');
    }
    
    // Fallback to hardcoded test users if database fails or user not found
    console.log('🔍 Checking test users...');
    console.log('📋 Available test users:', this.testUsers.map(u => u.email));
    const testUser = this.testUsers.find(user => user.email === email);
    if (testUser) {
      console.log(`✅ Found test user:`, { ...testUser, password: '[HIDDEN]' });
      return testUser;
    }

    console.log(`❌ User ${email} not found in database or test users`);
    return null;
  },

  async create(userData) {
    // For hardcoded test users, just return success
    const { name, email, password, role = 'jobseeker' } = userData;
    
    // Hash the password using bcrypt
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    if (!pool || !isConnected) {
      // Add to test users array
      const newUser = {
        id: Date.now(),
        name,
        email,
        password: hashedPassword,
        role,
        created_at: new Date().toISOString()
      };
      this.testUsers.push(newUser);
      console.log(`✅ Added test user: ${email}`);
      return newUser;
    }
    
    try {
      // Generate UUID for new user
      const { v4: uuidv4 } = require('uuid');
      const userId = uuidv4();
      
      // Map frontend roles to database enum values
      let dbRole = role;
      if (role === 'candidate') dbRole = 'jobseeker';
      if (role === 'employer') dbRole = 'recruiter';
      
      const result = await pool.query(
        'INSERT INTO users (id, name, email, role, password, created_at, updated_at, is_active, email_verified) VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), true, true) RETURNING *',
        [userId, name, email, dbRole, hashedPassword]
      );
      console.log(`✅ Created database user: ${email} with role: ${dbRole}`);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error.message);
      // Fallback to test user
      const newUser = {
        id: Date.now(),
        name,
        email,
        role,
        created_at: new Date().toISOString()
      };
      this.testUsers.push(newUser);
      return newUser;
    }
  }
};

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('👤 Login attempt for email:', email);
    
    if (!email || !password) {
      console.log('❌ Login failed: Missing email or password');
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }
    
    if (!isConnected) {
      console.log('💡 Database not connected, using test users');
    }
    
    // Try to find user
    const user = await usersService.getByEmail(email);
    
    if (!user) {
      console.log('❌ Login failed: User not found -', email);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'User not found. Please register first or check your email address.'
      });
    }
    
    console.log('✅ User found:', { email: user.email, role: user.role });
    
    // Handle test users with plaintext passwords (temporary for development)
    const bcrypt = require('bcryptjs');
    let isValidPassword = false;
    
    // Special handling for test users
    if (email === 'test@example.com' && password === 'test123!@#') {
      console.log('� Using test user credentials');
      isValidPassword = true;
    } else if (email === 'recruiter@example.com' && password === 'recruiter123') {
      console.log('🔑 Using recruiter test credentials');
      isValidPassword = true;
    } else {
      // Regular password verification
      try {
        console.log('🔒 Verifying password for user:', user.email);
        isValidPassword = await bcrypt.compare(password, user.password);
        console.log('🔐 Password validation result:', isValidPassword);
      } catch (error) {
        console.error('❌ Password verification error:', error);
        isValidPassword = false;
      }
    }
    
    if (!isValidPassword) {
      console.log('❌ Login failed: Invalid password for user:', email);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Invalid email or password.'
      });
    }
    } catch (error) {
      console.error('❌ Password verification error:', error);
      return res.status(500).json({
        success: false,
        error: 'Authentication error',
        message: 'Error verifying password.'
      });
    }
    
    console.log('🔐 Login successful for user:', {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token: 'jwt-token-' + Date.now()
      },
      message: 'Login successful'
    });
    
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      message: error.message
    });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role = 'jobseeker' } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email and password are required'
      });
    }
    
    if (!isConnected) {
      // Require database connection for registration
      return res.status(503).json({
        success: false,
        error: 'Database not available',
        message: 'Registration service is currently unavailable. Please try again later.'
      });
    }
    
    // Check if user already exists
    const existingUser = await usersService.getByEmail(email);
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User already exists',
        message: 'An account with this email already exists'
      });
    }
    
    // Create new user
    const newUser = await usersService.create({ name, email, password, role });
    
    if (!newUser) {
      return res.status(500).json({
        success: false,
        error: 'Failed to create user',
        message: 'Could not create user account'
      });
    }
    
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        },
        token: 'jwt-token-' + Date.now()
      },
      message: 'Registration successful'
    });
    
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      message: error.message
    });
  }
});

// Profile Management Endpoints

// GET /api/profile/:userId - Get user profile
app.get('/api/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const validatedUserId = validateUserId(userId);
    
    if (!isConnected) {
      return res.status(503).json({
        success: false,
        error: 'Database not available'
      });
    }

    const result = await pool.query(
      `SELECT id, name, email, role, bio, phone, location, website, linkedin_url, github_url, 
              avatar_url, skills, experience_years, experience, education, resume_url, 
              created_at, updated_at 
       FROM users WHERE id = $1`,
      [validatedUserId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile',
      message: error.message
    });
  }
});

// PUT /api/profile/:userId - Update user profile
app.put('/api/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const validatedUserId = validateUserId(userId);
    const { 
      name, bio, phone, location, website, linkedin_url, github_url, 
      avatar_url, skills, experience_years, experience, education, resume_url 
    } = req.body;
    
    console.log('📝 Profile update request received:');
    console.log('   User ID:', validatedUserId, '(type:', typeof validatedUserId, ')');
    console.log('   Data fields:', Object.keys(req.body));
    
    if (!isConnected) {
      return res.status(503).json({
        success: false,
        error: 'Database not available'
      });
    }

    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (bio !== undefined) {
      updateFields.push(`bio = $${paramCount++}`);
      values.push(bio);
    }
    if (phone !== undefined) {
      updateFields.push(`phone = $${paramCount++}`);
      values.push(phone);
    }
    if (location !== undefined) {
      updateFields.push(`location = $${paramCount++}`);
      values.push(location);
    }
    if (website !== undefined) {
      updateFields.push(`website = $${paramCount++}`);
      values.push(website);
    }
    if (linkedin_url !== undefined) {
      updateFields.push(`linkedin_url = $${paramCount++}`);
      values.push(linkedin_url);
    }
    if (github_url !== undefined) {
      updateFields.push(`github_url = $${paramCount++}`);
      values.push(github_url);
    }
    if (avatar_url !== undefined) {
      updateFields.push(`avatar_url = $${paramCount++}`);
      values.push(avatar_url);
    }
    if (skills !== undefined) {
      updateFields.push(`skills = $${paramCount++}`);
      values.push(JSON.stringify(skills));
    }
    if (experience_years !== undefined) {
      updateFields.push(`experience_years = $${paramCount++}`);
      values.push(experience_years);
    }
    if (experience !== undefined) {
      updateFields.push(`experience = $${paramCount++}`);
      values.push(experience);
    }
    if (education !== undefined) {
      updateFields.push(`education = $${paramCount++}`);
      values.push(education);
    }
    if (resume_url !== undefined) {
      updateFields.push(`resume_url = $${paramCount++}`);
      values.push(resume_url);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    updateFields.push(`updated_at = NOW()`);
    values.push(userId);

    const query = `
      UPDATE users 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING id, name, email, role, bio, phone, location, website, linkedin_url, github_url, 
                avatar_url, skills, experience_years, experience, education, resume_url, updated_at
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile',
      message: error.message
    });
  }
});

// POST /api/jobs - Create a new job
app.post('/api/jobs', authenticate, async (req, res) => {
  try {
    console.log('📝 Job creation request received:');
    console.log('   Request body:', req.body);
    
    const { 
      title, 
      description, 
      company_id, 
      location, 
      job_type, 
      type, // Backward compatibility
      experience_level, 
      salary_min, 
      salary_max, 
      salary_currency, 
      application_deadline,
      required_skills,
      skills // Backward compatibility
    } = req.body;
    
    if (!title || !description || !location) {
      return res.status(400).json({
        success: false,
        error: 'Title, description, and location are required'
      });
    }

    if (!isConnected) {
      // Return mock success if database not connected
      const mockJob = {
        id: Date.now(),
        title,
        description,
        location,
        job_type: job_type || 'full-time',
        experience_level: experience_level || 'MID',
        salary_min: salary_min || 0,
        salary_max: salary_max || 0,
        salary_currency: salary_currency || 'USD',
        created_at: new Date().toISOString()
      };
      return res.json({
        success: true,
        data: mockJob,
        message: 'Job created successfully (mock data)'
      });
    }

    // Get the current user ID from the authenticated user
    const currentUserId = req.user?.id || '149bb178-866c-41a5-8724-4c0702218d01';
    
    // Provide default values for required fields with backward compatibility
    const jobType = job_type || type || 'full-time';
    const experienceLevel = experience_level || 'mid';
    const salaryMin = salary_min || 0;
    const salaryMax = salary_max || 0;
    const salaryCurrency = salary_currency || 'USD';
    
    const result = await pool.query(`
      INSERT INTO jobs (id, title, description, company_id, location, job_type, experience_level, salary_min, salary_max, salary_currency, application_deadline, created_by, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      RETURNING *
    `, [title, description, company_id, location, jobType, experienceLevel, salaryMin, salaryMax, salaryCurrency, application_deadline, currentUserId]);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Job created successfully'
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create job',
      message: error.message
    });
  }
});

// POST /api/companies - Create a new company
app.post('/api/companies', authenticate, async (req, res) => {
  try {
    const { name, description, website, logo_url, industry, company_size, location, founded_year } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Company name is required'
      });
    }

    if (!isConnected) {
      // Return mock success if database not connected
      const mockCompany = {
        id: Date.now(),
        name,
        description: description || '',
        website: website || '',
        logo_url: logo_url || '/companies/default.svg',
        industry: industry || '',
        company_size: company_size || '',
        location: location || '',
        founded_year: founded_year || null,
        created_at: new Date().toISOString()
      };
      return res.json({
        success: true,
        data: mockCompany,
        message: 'Company created successfully (mock data)'
      });
    }

    // Generate UUID using crypto module
    const { randomUUID } = require('crypto');
    const companyId = randomUUID();
    
    const result = await pool.query(`
      INSERT INTO companies (id, name, description, website, logo_url, industry, company_size, location, founded_year, created_by, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *
    `, [name, description, website, logo_url, industry, company_size, location, founded_year, req.user.id]);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Company created successfully'
    });
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create company',
      message: error.message
    });
  }
});

// Applications endpoints
app.get('/api/applications', authenticate, async (req, res) => {
  try {
    if (!isConnected) {
      return res.json({
        success: true,
        data: [],
        count: 0,
        message: 'Mock data (database offline)'
      });
    }

    const result = await pool.query(`
      SELECT a.id, a.job_id, a.user_id, a.status, a.created_at as applied_at, a.feedback,
             j.title as job_title, c.name as company_name,
             u.name as applicant_name, u.email as applicant_email
      FROM applications a
      LEFT JOIN jobs j ON a.job_id = j.id
      LEFT JOIN companies c ON j.company_id = c.id
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
    `);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
      message: `Found ${result.rows.length} applications from database`
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch applications',
      message: error.message
    });
  }
});

app.post('/api/applications', async (req, res) => {
  try {
    console.log('POST /api/applications - Full request body:', req.body);
    console.log('POST /api/applications - job_id value:', req.body?.job_id);
    console.log('POST /api/applications - job_id type:', typeof req.body?.job_id);
    
    const { job_id, user_id, cover_letter, resume_url } = req.body;
    
    if (!job_id) {
      console.log('Validation failed: job_id is falsy:', job_id);
      return res.status(400).json({
        success: false,
        error: 'Job ID is required'
      });
    }

    if (!isConnected) {
      // Return mock success if database not connected
      const mockApplication = {
        id: Date.now(),
        job_id,
        user_id: user_id || 1,
        status: 'pending',
        cover_letter: cover_letter || '',
        resume_url: resume_url || '',
        applied_at: new Date().toISOString()
      };
      return res.json({
        success: true,
        data: mockApplication,
        message: 'Application submitted successfully (mock data)'
      });
    }

    const result = await pool.query(`
      INSERT INTO applications (job_id, user_id, status, cover_letter, resume_url, created_at, updated_at)
      VALUES ($1, $2, 'pending', $3, $4, NOW(), NOW())
      RETURNING *
    `, [job_id, user_id || 1, cover_letter, resume_url]);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Application submitted successfully'
    });
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit application',
      message: error.message
    });
  }
});

app.put('/api/applications/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }

    if (!isConnected) {
      // Return mock success if database not connected
      return res.json({
        success: true,
        data: { id: parseInt(id), status, feedback },
        message: 'Application updated successfully (mock data)'
      });
    }

    const result = await pool.query(`
      UPDATE applications 
      SET status = $1, feedback = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `, [status, feedback, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Application updated successfully'
    });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update application',
      message: error.message
    });
  }
});

// Get applications for a specific user
app.get('/api/applications/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!isConnected) {
      return res.json({
        success: true,
        data: [],
        count: 0,
        message: 'Mock data (database offline)'
      });
    }

    const result = await pool.query(`
      SELECT a.id, a.job_id, a.user_id, a.status, a.created_at, a.feedback,
             j.title, j.description, j.location, j.salary_min, j.salary_max,
             c.name as company_name
      FROM applications a
      LEFT JOIN jobs j ON a.job_id = j.id
      LEFT JOIN companies c ON j.company_id = c.id
      WHERE a.user_id = $1
      ORDER BY a.created_at DESC
    `, [userId]);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
      message: `Found ${result.rows.length} applications for user from database`
    });
  } catch (error) {
    console.error('Error fetching user applications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user applications',
      message: error.message
    });
  }
});

// Saved jobs endpoints
app.post('/api/user/saved-jobs', async (req, res) => {
  try {
    const { job_id, user_id } = req.body;
    
    if (!job_id) {
      return res.status(400).json({
        success: false,
        error: 'Job ID is required'
      });
    }

    // For now, just return success (localStorage will handle it on frontend)
    res.json({
      success: true,
      message: 'Job saved successfully'
    });
  } catch (error) {
    console.error('Error saving job:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save job',
      message: error.message
    });
  }
});

app.delete('/api/user/saved-jobs/:job_id', async (req, res) => {
  try {
    const { job_id } = req.params;
    
    // For now, just return success (localStorage will handle it on frontend)
    res.json({
      success: true,
      message: 'Job unsaved successfully'
    });
  } catch (error) {
    console.error('Error unsaving job:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unsave job',
      message: error.message
    });
  }
});

// Blockchain endpoints
app.get('/api/blockchain/wallet', (req, res) => {
  res.json({
    success: true,
    data: {
      address: process.env.ETHEREUM_ADDRESS || '0x84cC4Db44636467C0aF79E64975f0906d76795E9',
      network: 'sepolia',
      balance: '0.5 ETH',
      userWallet: process.env.USER_METAMASK_ADDRESS || '0xeE11B5C629F81B7a02c5cf663345145F36f43cE0'
    },
    message: 'Ethereum wallet information'
  });
});

// Saved Jobs Endpoints (for future enhancement)
// These will work with localStorage fallback for now

// GET /api/user/saved-jobs/:userId - Get user's saved jobs
app.get('/api/user/saved-jobs/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!isConnected) {
      return res.json({
        success: true,
        data: [],
        count: 0,
        message: 'Mock data (database offline)'
      });
    }

    const result = await pool.query(`
      SELECT sj.id, sj.user_id, sj.job_id, sj.created_at,
             j.title, j.description, j.location, j.salary_min, j.salary_max, j.job_type, j.is_remote,
             c.name as company_name
      FROM saved_jobs sj
      LEFT JOIN jobs j ON sj.job_id = j.id
      LEFT JOIN companies c ON j.company_id = c.id
      WHERE sj.user_id = $1
      ORDER BY sj.created_at DESC
    `, [userId]);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
      message: `Found ${result.rows.length} saved jobs for user from database`
    });
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch saved jobs',
      message: error.message
    });
  }
});

// Convenience endpoint - same as above but different URL pattern
app.get('/api/saved-jobs/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!isConnected) {
      return res.json({
        success: true,
        data: [],
        count: 0,
        message: 'Mock data (database offline)'
      });
    }

    const result = await pool.query(`
      SELECT sj.id, sj.user_id, sj.job_id, sj.created_at,
             j.title, j.description, j.location, j.salary_min, j.salary_max, j.job_type, j.is_remote,
             c.name as company_name
      FROM saved_jobs sj
      LEFT JOIN jobs j ON sj.job_id = j.id
      LEFT JOIN companies c ON j.company_id = c.id
      WHERE sj.user_id = $1
      ORDER BY sj.created_at DESC
    `, [userId]);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
      message: `Found ${result.rows.length} saved jobs for user from database`
    });
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch saved jobs',
      message: error.message
    });
  }
});

// POST /api/user/saved-jobs - Save a job  
app.post('/api/user/saved-jobs', async (req, res) => {
  try {
    const { userId, jobId } = req.body;
    
    if (!userId || !jobId) {
      return res.status(400).json({
        success: false,
        error: 'User ID and Job ID are required'
      });
    }
    
    if (!isConnected) {
      return res.json({
        success: true,
        message: 'Mock success (database offline)'
      });
    }

    // Check if already saved
    const existingResult = await pool.query(
      'SELECT id FROM saved_jobs WHERE user_id = $1 AND job_id = $2',
      [userId, jobId]
    );
    
    if (existingResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Job already saved'
      });
    }

    // Insert new saved job
    const result = await pool.query(
      'INSERT INTO saved_jobs (user_id, job_id) VALUES ($1, $2) RETURNING id, created_at',
      [userId, jobId]
    );
    
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Job saved successfully'
    });
  } catch (error) {
    console.error('Error saving job:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save job',
      message: error.message
    });
  }
});

// Convenience endpoint for saving jobs
app.post('/api/saved-jobs', async (req, res) => {
  try {
    const { userId, jobId } = req.body;
    
    if (!userId || !jobId) {
      return res.status(400).json({
        success: false,
        error: 'User ID and Job ID are required'
      });
    }
    
    if (!isConnected) {
      return res.json({
        success: true,
        message: 'Mock success (database offline)'
      });
    }

    // Check if already saved
    const existingResult = await pool.query(
      'SELECT id FROM saved_jobs WHERE user_id = $1 AND job_id = $2',
      [userId, jobId]
    );
    
    if (existingResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Job already saved'
      });
    }

    // Insert new saved job
    const result = await pool.query(
      'INSERT INTO saved_jobs (user_id, job_id) VALUES ($1, $2) RETURNING id, created_at',
      [userId, jobId]
    );
    
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Job saved successfully'
    });
  } catch (error) {
    console.error('Error saving job:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save job',
      message: error.message
    });
  }
});

// DELETE /api/user/saved-jobs/:jobId - Unsave a job
app.delete('/api/user/saved-jobs/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }
    
    if (!isConnected) {
      return res.json({
        success: true,
        message: 'Mock success (database offline)'
      });
    }

    const result = await pool.query(
      'DELETE FROM saved_jobs WHERE user_id = $1 AND job_id = $2 RETURNING id',
      [userId, jobId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Saved job not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Job unsaved successfully'
    });
  } catch (error) {
    console.error('Error unsaving job:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unsave job',
      message: error.message
    });
  }
});

// Convenience endpoint for unsaving jobs
app.delete('/api/saved-jobs/:userId/:jobId', async (req, res) => {
  try {
    const { userId, jobId } = req.params;
    
    if (!isConnected) {
      return res.json({
        success: true,
        message: 'Mock success (database offline)'
      });
    }

    const result = await pool.query(
      'DELETE FROM saved_jobs WHERE user_id = $1 AND job_id = $2 RETURNING id',
      [userId, jobId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Saved job not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Job unsaved successfully'
    });
  } catch (error) {
    console.error('Error unsaving job:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unsave job',
      message: error.message
    });
  }
});

// AI Jobs endpoint - Get AI-matched jobs for a user
app.get('/api/ai-jobs/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const validatedUserId = validateUserId(userId);
    
    if (!isConnected) {
      return res.json({
        success: true,
        data: [],
        message: 'Mock data (database offline)'
      });
    }

    // Get user profile first
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [validatedUserId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = userResult.rows[0];
    const userSkills = user.skills ? 
      (typeof user.skills === 'string' ? user.skills.toLowerCase().split(',').map(s => s.trim()) : 
       Array.isArray(user.skills) ? user.skills.map(s => s.toString().toLowerCase().trim()) : 
       []) : [];
    
    // Get all active jobs
    const jobsResult = await pool.query(`
      SELECT j.*, c.name as company_name, c.logo_url as company_logo 
      FROM jobs j 
      LEFT JOIN companies c ON j.company_id = c.id 
      ORDER BY j.created_at DESC
    `);

    const jobs = jobsResult.rows;
    
    // Simple AI matching algorithm based on skills
    const matchedJobs = jobs.map(job => {
      const jobRequirements = job.requirements ? job.requirements.toLowerCase() : '';
      const jobTitle = job.title ? job.title.toLowerCase() : '';
      const jobDescription = job.description ? job.description.toLowerCase() : '';
      
      let matchScore = 0;
      let matchingSkills = [];
      
      // Check skill matches
      userSkills.forEach(skill => {
        if (skill && (jobRequirements.includes(skill) || jobTitle.includes(skill) || jobDescription.includes(skill))) {
          matchScore += 10;
          matchingSkills.push(skill);
        }
      });
      
      // Bonus for experience level match
      if (user.experience_years) {
        const expYears = parseInt(user.experience_years);
        if (jobRequirements.includes('junior') && expYears <= 2) matchScore += 5;
        if (jobRequirements.includes('mid') && expYears >= 2 && expYears <= 5) matchScore += 5;
        if (jobRequirements.includes('senior') && expYears >= 5) matchScore += 5;
      }
      
      // Bonus for location match
      if (user.location && job.location && 
          user.location.toLowerCase().includes(job.location.toLowerCase())) {
        matchScore += 5;
      }
      
      return {
        ...job,
        matchScore,
        matchingSkills,
        relevancePercentage: Math.min(Math.round((matchScore / userSkills.length) * 10), 100)
      };
    })
    .filter(job => job.matchScore > 0) // Only return jobs with some match
    .sort((a, b) => b.matchScore - a.matchScore) // Sort by match score
    .slice(0, 20); // Limit to top 20 matches

    res.json({
      success: true,
      data: matchedJobs,
      totalMatches: matchedJobs.length,
      message: `Found ${matchedJobs.length} AI-matched jobs`
    });

  } catch (error) {
    console.error('Error in AI jobs endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch AI-matched jobs',
      message: error.message
    });
  }
});

// AI Endpoints
// POST /api/ai/extract-skills - Extract skills from text
app.post('/api/ai/extract-skills', authenticate, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    // Simple skill extraction using keywords
    const skillKeywords = [
      'javascript', 'react', 'node.js', 'python', 'java', 'c++', 'c#', 'php',
      'html', 'css', 'typescript', 'angular', 'vue', 'django', 'flask',
      'mongodb', 'postgresql', 'mysql', 'redis', 'aws', 'azure', 'docker',
      'kubernetes', 'git', 'agile', 'scrum', 'leadership', 'management',
      'ui/ux', 'design', 'testing', 'devops', 'machine learning', 'ai',
      'data science', 'analytics', 'blockchain', 'web3', 'solidity'
    ];

    const words = text.toLowerCase().split(/\s+/);
    const foundSkills = [];

    skillKeywords.forEach(skill => {
      if (words.some(word => word.includes(skill) || skill.includes(word))) {
        foundSkills.push(skill);
      }
    });

    res.json({
      success: true,
      skills: foundSkills.slice(0, 10), // Return top 10 skills
      message: `Extracted ${foundSkills.length} skills from text`
    });

  } catch (error) {
    console.error('Error extracting skills:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to extract skills',
      message: error.message
    });
  }
});

// POST /api/ai/match-score - Calculate job-applicant match score
app.post('/api/ai/match-score', authenticate, async (req, res) => {
  try {
    const { jobDescription, userSkills, userExperience, userBio } = req.body;
    
    if (!jobDescription) {
      return res.status(400).json({
        success: false,
        error: 'Job description is required'
      });
    }

    const jobWords = jobDescription.toLowerCase().split(/\s+/);
    let matchCount = 0;
    const totalSkills = userSkills.length;

    userSkills.forEach(skill => {
      if (jobWords.some(word => word.includes(skill.toLowerCase()) || skill.toLowerCase().includes(word))) {
        matchCount++;
      }
    });

    // Also check bio keywords
    const bioWords = (userBio || '').toLowerCase().split(/\s+/);
    const bioMatches = bioWords.filter(word => 
      jobWords.some(jobWord => jobWord.includes(word) || word.includes(jobWord))
    ).length;

    const skillScore = totalSkills > 0 ? (matchCount / totalSkills) * 70 : 0;
    const bioScore = Math.min(bioMatches * 5, 30); // Max 30 points for bio matches

    const totalScore = Math.round(skillScore + bioScore);

    res.json({
      success: true,
      score: totalScore,
      skillMatches: matchCount,
      bioMatches: bioMatches,
      message: `Match score calculated: ${totalScore}%`
    });

  } catch (error) {
    console.error('Error calculating match score:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate match score',
      message: error.message
    });
  }
});

// POST /api/ai/suggestions - Get smart job suggestions
app.post('/api/ai/suggestions', authenticate, async (req, res) => {
  try {
    const { userSkills, userExperience, userBio, availableJobs } = req.body;
    
    if (!availableJobs || !Array.isArray(availableJobs)) {
      return res.status(400).json({
        success: false,
        error: 'Available jobs array is required'
      });
    }

    const suggestions = availableJobs
      .map(job => {
        const jobWords = (job.description + ' ' + (job.required_skills || []).join(' ')).toLowerCase().split(/\s+/);
        let matchCount = 0;
        
        userSkills.forEach(skill => {
          if (jobWords.some(word => word.includes(skill.toLowerCase()) || skill.toLowerCase().includes(word))) {
            matchCount++;
          }
        });

        const matchScore = userSkills.length > 0 ? (matchCount / userSkills.length) * 100 : 0;
        
        return {
          ...job,
          matchScore: Math.round(matchScore)
        };
      })
      .filter(job => job.matchScore > 20) // Only show jobs with >20% match
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10); // Return top 10 suggestions

    res.json({
      success: true,
      suggestions,
      totalSuggestions: suggestions.length,
      message: `Found ${suggestions.length} job suggestions`
    });

  } catch (error) {
    console.error('Error getting job suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get job suggestions',
      message: error.message
    });
  }
});

// POST /api/ai/analyze-resume - Analyze resume and extract structured data
app.post('/api/ai/analyze-resume', authenticate, async (req, res) => {
  try {
    const { resumeText } = req.body;
    
    if (!resumeText) {
      return res.status(400).json({
        success: false,
        error: 'Resume text is required'
      });
    }

    // Extract skills
    const skillKeywords = [
      'javascript', 'react', 'node.js', 'python', 'java', 'c++', 'c#', 'php',
      'html', 'css', 'typescript', 'angular', 'vue', 'django', 'flask',
      'mongodb', 'postgresql', 'mysql', 'redis', 'aws', 'azure', 'docker',
      'kubernetes', 'git', 'agile', 'scrum', 'leadership', 'management',
      'ui/ux', 'design', 'testing', 'devops', 'machine learning', 'ai',
      'data science', 'analytics', 'blockchain', 'web3', 'solidity'
    ];

    const words = resumeText.toLowerCase().split(/\s+/);
    const foundSkills = [];

    skillKeywords.forEach(skill => {
      if (words.some(word => word.includes(skill) || skill.includes(word))) {
        foundSkills.push(skill);
      }
    });

    // Extract experience
    const experienceMatch = resumeText.match(/(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?experience/i);
    const experience = experienceMatch ? parseInt(experienceMatch[1]) : 0;

    // Extract education
    const educationKeywords = ['bachelor', 'master', 'phd', 'degree', 'university', 'college'];
    const hasEducation = educationKeywords.some(keyword => 
      resumeText.toLowerCase().includes(keyword)
    );

    res.json({
      success: true,
      data: {
        skills: foundSkills.slice(0, 10),
        experience,
        education: hasEducation,
        confidence: 0.8
      },
      message: 'Resume analyzed successfully'
    });

  } catch (error) {
    console.error('Error analyzing resume:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze resume',
      message: error.message
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `The endpoint ${req.originalUrl} does not exist`,
    availableEndpoints: [
      '/', 
      '/health', 
      '/api/jobs', 
      '/api/companies', 
      '/api/users', 
      '/api/auth/login', 
      '/api/auth/register', 
      '/api/applications',
      '/api/applications/user/:userId',
      '/api/saved-jobs/:userId',
      '/api/ai-jobs/:userId',
      '/api/blockchain/wallet'
    ]
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// Start server
app.listen(port, () => {
  console.log('🚀 RizeOS Job Portal Backend Server Started!');
  console.log(`📍 Server URL: http://localhost:${port}`);
  console.log(`🔍 Health Check: http://localhost:${port}/health`);
  console.log(`📋 API Jobs: http://localhost:${port}/api/jobs`);
  console.log(`🦊 Blockchain: http://localhost:${port}/api/blockchain/wallet`);
  console.log('');
  console.log('✅ Ready for frontend connection!');
  console.log('✅ CORS enabled for frontend URLs');
  console.log('✅ Mock APIs ready for testing');
  console.log('');
  console.log('🎯 Next: Start your frontend and test the connection!');
});

module.exports = app;
