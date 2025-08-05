/**
 * Supabase Database Service
 * Works with existing Supabase database schema
 */

const { Pool } = require('pg');
require('dotenv').config();

// Working configuration for Supabase (matches test-supabase-fix.js)
const dbConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
        rejectUnauthorized: false
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    acquireTimeoutMillis: 60000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
    statement_timeout: 30000,
    query_timeout: 30000
};

// Create the connection pool
const pool = new Pool(dbConfig);

// Handle pool errors
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

// Test connection
const testConnection = async () => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
        console.log('✅ Database connected successfully!');
        console.log(`   Time: ${result.rows[0].current_time}`);
        console.log(`   PostgreSQL Version: ${result.rows[0].pg_version.split(' ')[0]}`);
        client.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
};

// Query helper function
const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Executed query', { text: text.substring(0, 50) + '...', duration, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('Query error:', { text: text.substring(0, 50) + '...', error: error.message });
        throw error;
    }
};

// Get a client from the pool for transactions
const getClient = async () => {
    return await pool.connect();
};

// Database service functions using existing Supabase schema

/**
 * Users service
 */
const usersService = {
    // Get all users (adjust to existing schema)
    async getAll() {
        const result = await query('SELECT id, name, email, role, bio, avatar_url, location, phone, website, linkedin_url, github_url, skills, experience_years, wallet_address, email_verified, is_active, created_at, updated_at FROM users ORDER BY created_at DESC');
        return result.rows;
    },

    // Get user by ID
    async getById(id) {
        const result = await query('SELECT id, name, email, role, bio, avatar_url, location, phone, website, linkedin_url, github_url, skills, experience_years, wallet_address, email_verified, is_active, created_at, updated_at FROM users WHERE id = $1', [id]);
        return result.rows[0];
    },

    // Get user by email
    async getByEmail(email) {
        const result = await query('SELECT id, name, email, role, bio, avatar_url, location, phone, website, linkedin_url, github_url, skills, experience_years, wallet_address, email_verified, is_active, created_at, updated_at FROM users WHERE email = $1', [email]);
        return result.rows[0];
    },

    // Create new user (adjust to existing schema)
    async create(userData) {
        const { name, email, password, role = 'jobseeker', bio, location, phone, website, linkedin_url, github_url, skills, experience_years, wallet_address } = userData;
        const result = await query(`
            INSERT INTO users (name, email, encrypted_password, role, bio, location, phone, website, linkedin_url, github_url, skills, experience_years, wallet_address, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
            RETURNING id, name, email, role, created_at
        `, [name, email, password, role, bio, location, phone, website, linkedin_url, github_url, JSON.stringify(skills || []), experience_years, wallet_address]);
        return result.rows[0];
    }
};

/**
 * Companies service
 */
const companiesService = {
    // Get all companies
    async getAll() {
        const result = await query(`
            SELECT c.id, c.name, c.description, c.website, c.logo_url, c.industry, c.company_size, c.location, c.founded_year, c.is_verified, c.created_at, c.updated_at,
                   u.name as creator_name, u.email as creator_email
            FROM companies c
            LEFT JOIN users u ON c.created_by = u.id
            ORDER BY c.created_at DESC
        `);
        return result.rows;
    },

    // Get company by ID
    async getById(id) {
        const result = await query(`
            SELECT c.id, c.name, c.description, c.website, c.logo_url, c.industry, c.company_size, c.location, c.founded_year, c.is_verified, c.created_at, c.updated_at,
                   u.name as creator_name, u.email as creator_email
            FROM companies c
            LEFT JOIN users u ON c.created_by = u.id
            WHERE c.id = $1
        `, [id]);
        return result.rows[0];
    },

    // Create new company
    async create(companyData) {
        const { name, description, website, logo_url, industry, company_size, location, founded_year, created_by } = companyData;
        const result = await query(`
            INSERT INTO companies (id, name, description, website, logo_url, industry, company_size, location, founded_year, created_by, created_at, updated_at)
            VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
            RETURNING id, name, description, website, logo_url, industry, company_size, location, founded_year, is_verified, created_at
        `, [name, description, website, logo_url, industry, company_size, location, founded_year, created_by]);
        return result.rows[0];
    }
};

/**
 * Jobs service
 */
const jobsService = {
    // Get all active jobs
    async getAll(filters = {}) {
        let whereClause = 'WHERE j.is_active = true';
        const params = [];
        let paramCount = 0;

        if (filters.location) {
            paramCount++;
            whereClause += ` AND j.location ILIKE $${paramCount}`;
            params.push(`%${filters.location}%`);
        }

        if (filters.job_type) {
            paramCount++;
            whereClause += ` AND j.job_type = $${paramCount}`;
            params.push(filters.job_type);
        }

        if (filters.experience_level) {
            paramCount++;
            whereClause += ` AND j.experience_level = $${paramCount}`;
            params.push(filters.experience_level);
        }

        const result = await query(`
            SELECT j.id, j.title, j.description, j.location, j.job_type, j.experience_level, 
                   j.salary_min, j.salary_max, j.currency, j.application_deadline, j.is_featured,
                   j.created_at, j.updated_at,
                   c.name as company_name, c.logo_url as company_logo, c.location as company_location,
                   u.name as posted_by_name
            FROM jobs j
            LEFT JOIN companies c ON j.company_id = c.id
            LEFT JOIN users u ON j.created_by = u.id
            ${whereClause}
            ORDER BY j.is_featured DESC, j.created_at DESC
        `, params);
        return result.rows;
    },

    // Get job by ID
    async getById(id) {
        const result = await query(`
            SELECT j.id, j.title, j.description, j.location, j.job_type, j.experience_level, 
                   j.salary_min, j.salary_max, j.currency, j.application_deadline, j.is_featured,
                   j.created_at, j.updated_at,
                   c.id as company_id, c.name as company_name, c.description as company_description,
                   c.logo_url as company_logo, c.website as company_website, c.location as company_location,
                   u.id as posted_by_id, u.name as posted_by_name, u.email as posted_by_email
            FROM jobs j
            LEFT JOIN companies c ON j.company_id = c.id
            LEFT JOIN users u ON j.created_by = u.id
            WHERE j.id = $1
        `, [id]);
        return result.rows[0];
    },

    // Create new job
    async create(jobData) {
        const { title, description, company_id, created_by, location, job_type, experience_level, salary_min, salary_max, currency, application_deadline } = jobData;
        const result = await query(`
            INSERT INTO jobs (title, description, company_id, created_by, location, job_type, experience_level, salary_min, salary_max, currency, application_deadline, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
            RETURNING id, title, description, location, job_type, experience_level, salary_min, salary_max, currency, application_deadline, created_at
        `, [title, description, company_id, created_by, location, job_type, experience_level, salary_min, salary_max, currency, application_deadline]);
        return result.rows[0];
    }
};

/**
 * Applications service
 */
const applicationsService = {
    // Get applications for a job
    async getByJobId(jobId) {
        const result = await query(`
            SELECT a.id, a.cover_letter, a.resume_url, a.status, a.created_at, a.updated_at,
                   u.id as candidate_id, u.name as candidate_name, u.email as candidate_email,
                   u.location as candidate_location, u.skills as candidate_skills
            FROM applications a
            LEFT JOIN users u ON a.user_id = u.id
            WHERE a.job_id = $1
            ORDER BY a.created_at DESC
        `, [jobId]);
        return result.rows;
    },

    // Get applications by user
    async getByUserId(userId) {
        const result = await query(`
            SELECT a.id, a.cover_letter, a.resume_url, a.status, a.created_at, a.updated_at,
                   j.id as job_id, j.title as job_title, j.location as job_location,
                   c.name as company_name, c.logo_url as company_logo
            FROM applications a
            LEFT JOIN jobs j ON a.job_id = j.id
            LEFT JOIN companies c ON j.company_id = c.id
            WHERE a.user_id = $1
            ORDER BY a.created_at DESC
        `, [userId]);
        return result.rows;
    },

    // Create new application
    async create(applicationData) {
        const { job_id, user_id, cover_letter, resume_url } = applicationData;
        const result = await query(`
            INSERT INTO applications (job_id, user_id, cover_letter, resume_url, created_at, updated_at)
            VALUES ($1, $2, $3, $4, NOW(), NOW())
            RETURNING id, job_id, user_id, cover_letter, resume_url, status, created_at
        `, [job_id, user_id, cover_letter, resume_url]);
        return result.rows[0];
    }
};

// Initialize database function
const initializeDatabase = async () => {
    try {
        console.log('🚀 Connecting to existing Supabase database...');
        
        // Test connection
        const connectionTest = await testConnection();
        if (!connectionTest) {
            throw new Error('Database connection failed');
        }
        
        console.log('📊 Checking existing data...');
        
        // Check if we have users (adjust query to match existing schema)
        const userCount = await query('SELECT COUNT(*) as count FROM users');
        console.log(`   Users: ${userCount.rows[0].count}`);
        
        // Check if we have companies
        const companyCount = await query('SELECT COUNT(*) as count FROM companies');
        console.log(`   Companies: ${companyCount.rows[0].count}`);
        
        // Check if we have jobs
        const jobCount = await query('SELECT COUNT(*) as count FROM jobs WHERE is_active = true');
        console.log(`   Active Jobs: ${jobCount.rows[0].count}`);
        
        console.log('✅ Database connection established with existing Supabase schema!');
        console.log('🎯 Backend is ready to serve API requests!');
        return true;
        
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        throw error;
    }
};

// Close database connection
const closeConnection = async () => {
    try {
        await pool.end();
        console.log('✅ Database connection closed successfully');
    } catch (error) {
        console.error('❌ Error closing database connection:', error.message);
        throw error;
    }
};

module.exports = {
    pool,
    query,
    getClient,
    testConnection,
    initializeDatabase,
    closeConnection,
    
    // Services
    usersService,
    companiesService,
    jobsService,
    applicationsService,
    
    // Compatibility with existing code
    sequelize: {
        authenticate: testConnection,
        close: closeConnection
    }
};
