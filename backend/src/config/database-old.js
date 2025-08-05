/**
 * Database Configuration
 * Fixed PostgreSQL connection with proper SSL configuration for existing Supabase schema
 */

// Import the main database service
const databaseService = require('../services/databaseService');

// Export all database service functions for backward compatibility
module.exports = databaseService;

/**
 * Test database connection
 */
// Test connection on startup
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

// Initialize database tables
const initializeTables = async () => {
    console.log('🔧 Initializing database tables...');
    
    const queries = [
        // Users table - Create first as it's referenced by other tables
        `CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            full_name VARCHAR(255) NOT NULL,
            user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('candidate', 'recruiter', 'admin')),
            profile_image VARCHAR(500),
            phone VARCHAR(20),
            location VARCHAR(255),
            bio TEXT,
            wallet_address VARCHAR(255),
            is_verified BOOLEAN DEFAULT FALSE,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        
        // Companies table
        `CREATE TABLE IF NOT EXISTS companies (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            logo_url VARCHAR(500),
            website VARCHAR(255),
            industry VARCHAR(100),
            size VARCHAR(50),
            location VARCHAR(255),
            founded_year INTEGER,
            recruiter_id INTEGER,
            is_verified BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        
        // Jobs table
        `CREATE TABLE IF NOT EXISTS jobs (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            company_id INTEGER,
            recruiter_id INTEGER,
            location VARCHAR(255),
            job_type VARCHAR(50) CHECK (job_type IN ('full-time', 'part-time', 'contract', 'internship', 'remote')),
            experience_level VARCHAR(50) CHECK (experience_level IN ('entry', 'mid', 'senior', 'lead', 'executive')),
            salary_min INTEGER,
            salary_max INTEGER,
            currency VARCHAR(10) DEFAULT 'USD',
            skills TEXT[], -- Array of required skills
            requirements TEXT,
            benefits TEXT,
            application_deadline DATE,
            is_active BOOLEAN DEFAULT TRUE,
            is_featured BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        
        // Applications table
        `CREATE TABLE IF NOT EXISTS applications (
            id SERIAL PRIMARY KEY,
            job_id INTEGER,
            candidate_id INTEGER,
            resume_url VARCHAR(500),
            cover_letter TEXT,
            status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'shortlisted', 'interviewed', 'offered', 'hired', 'rejected')),
            applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        
        // Saved jobs table
        `CREATE TABLE IF NOT EXISTS saved_jobs (
            id SERIAL PRIMARY KEY,
            user_id INTEGER,
            job_id INTEGER,
            saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    ];
    
    // Foreign key constraints - add after tables are created
    const constraintQueries = [
        // Add foreign key constraints only if they don't exist
        `DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                          WHERE constraint_name = 'companies_recruiter_id_fkey') THEN
                ALTER TABLE companies ADD CONSTRAINT companies_recruiter_id_fkey 
                FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE SET NULL;
            END IF;
        END $$`,
        
        `DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                          WHERE constraint_name = 'jobs_company_id_fkey') THEN
                ALTER TABLE jobs ADD CONSTRAINT jobs_company_id_fkey 
                FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
            END IF;
        END $$`,
        
        `DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                          WHERE constraint_name = 'jobs_recruiter_id_fkey') THEN
                ALTER TABLE jobs ADD CONSTRAINT jobs_recruiter_id_fkey 
                FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE;
            END IF;
        END $$`,
        
        `DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                          WHERE constraint_name = 'applications_job_id_fkey') THEN
                ALTER TABLE applications ADD CONSTRAINT applications_job_id_fkey 
                FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;
            END IF;
        END $$`,
        
        `DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                          WHERE constraint_name = 'applications_candidate_id_fkey') THEN
                ALTER TABLE applications ADD CONSTRAINT applications_candidate_id_fkey 
                FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE;
            END IF;
        END $$`,
        
        `DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                          WHERE constraint_name = 'saved_jobs_user_id_fkey') THEN
                ALTER TABLE saved_jobs ADD CONSTRAINT saved_jobs_user_id_fkey 
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
            END IF;
        END $$`,
        
        `DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                          WHERE constraint_name = 'saved_jobs_job_id_fkey') THEN
                ALTER TABLE saved_jobs ADD CONSTRAINT saved_jobs_job_id_fkey 
                FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;
            END IF;
        END $$`
    ];
    
    // Unique constraints
    const uniqueConstraintQueries = [
        `DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                          WHERE constraint_name = 'applications_job_candidate_unique') THEN
                ALTER TABLE applications ADD CONSTRAINT applications_job_candidate_unique 
                UNIQUE(job_id, candidate_id);
            END IF;
        END $$`,
        
        `DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                          WHERE constraint_name = 'saved_jobs_user_job_unique') THEN
                ALTER TABLE saved_jobs ADD CONSTRAINT saved_jobs_user_job_unique 
                UNIQUE(user_id, job_id);
            END IF;
        END $$`
    ];
    
    // Index queries
    const indexQueries = [
        `CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id)`,
        `CREATE INDEX IF NOT EXISTS idx_jobs_recruiter_id ON jobs(recruiter_id)`,
        `CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location)`,
        `CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON jobs(job_type)`,
        `CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON jobs(is_active)`,
        `CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id)`,
        `CREATE INDEX IF NOT EXISTS idx_applications_candidate_id ON applications(candidate_id)`,
        `CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status)`,
        `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
        `CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type)`,
        `CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON saved_jobs(user_id)`,
        `CREATE INDEX IF NOT EXISTS idx_saved_jobs_job_id ON saved_jobs(job_id)`
    ];
    
    try {
        // Create tables first
        console.log('📋 Creating tables...');
        for (const queryText of queries) {
            await query(queryText);
        }
        
        // Add foreign key constraints
        console.log('🔗 Adding foreign key constraints...');
        for (const constraintQuery of constraintQueries) {
            await query(constraintQuery);
        }
        
        // Add unique constraints
        console.log('🔒 Adding unique constraints...');
        for (const uniqueQuery of uniqueConstraintQueries) {
            await query(uniqueQuery);
        }
        
        // Create indexes
        console.log('⚡ Creating indexes...');
        for (const indexQuery of indexQueries) {
            await query(indexQuery);
        }
        
        console.log('✅ Database tables initialized successfully!');
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize database tables:', error.message);
        return false;
    }
};

// Seed sample data
const seedSampleData = async () => {
    console.log('🌱 Seeding sample data...');
    
    try {
        // Check if data already exists
        const existingUsers = await query('SELECT COUNT(*) FROM users');
        if (parseInt(existingUsers.rows[0].count) > 0) {
            console.log('📊 Sample data already exists, skipping seed...');
            return true;
        }
        
        // Sample companies
        await query(`
            INSERT INTO companies (name, description, logo_url, website, industry, size, location) VALUES
            ('TechCorp Innovation', 'Leading technology company specializing in AI and blockchain solutions', '/companies/techcorp.png', 'https://techcorp.com', 'Technology', '1000-5000', 'San Francisco, CA'),
            ('DataFlow Systems', 'Big data analytics and cloud computing services', '/companies/dataflow.png', 'https://dataflow.com', 'Data Analytics', '500-1000', 'Seattle, WA'),
            ('BlockChain Ventures', 'Blockchain development and cryptocurrency solutions', '/companies/blockchain.png', 'https://blockchainventures.com', 'Blockchain', '50-200', 'Austin, TX'),
            ('AI Dynamics', 'Artificial intelligence and machine learning research', '/companies/aidynamics.png', 'https://aidynamics.com', 'Artificial Intelligence', '200-500', 'Boston, MA')
        `);
        
        // Sample jobs
        await query(`
            INSERT INTO jobs (title, description, company_id, location, job_type, experience_level, salary_min, salary_max, skills, requirements) VALUES
            ('Senior Frontend Developer', 'Join our dynamic team to build cutting-edge web applications using React, TypeScript, and modern frontend technologies.', 1, 'San Francisco, CA', 'full-time', 'senior', 120000, 160000, ARRAY['React', 'TypeScript', 'JavaScript', 'CSS', 'HTML'], 'Bachelor''s degree in Computer Science or equivalent experience. 5+ years of frontend development experience.'),
            ('Blockchain Developer', 'Work on revolutionary blockchain solutions using Ethereum, Solana, and smart contract development.', 3, 'Austin, TX', 'full-time', 'mid', 100000, 140000, ARRAY['Solidity', 'Ethereum', 'Web3', 'JavaScript', 'Node.js'], '3+ years of blockchain development experience. Knowledge of smart contracts and DeFi protocols.'),
            ('Data Scientist', 'Analyze large datasets and build predictive models to drive business insights.', 2, 'Seattle, WA', 'full-time', 'mid', 110000, 150000, ARRAY['Python', 'Machine Learning', 'SQL', 'TensorFlow', 'PyTorch'], 'MS in Data Science or related field. Experience with machine learning frameworks.'),
            ('AI Research Engineer', 'Research and develop next-generation AI algorithms and models.', 4, 'Boston, MA', 'full-time', 'senior', 140000, 180000, ARRAY['Python', 'Deep Learning', 'PyTorch', 'Research', 'Mathematics'], 'PhD in AI/ML or equivalent. Published research in top-tier conferences.'),
            ('Full Stack Developer', 'Build end-to-end web applications using modern technologies.', 1, 'Remote', 'remote', 'mid', 90000, 130000, ARRAY['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'AWS'], '3+ years of full-stack development experience. Strong problem-solving skills.')
        `);
        
        console.log('✅ Sample data seeded successfully!');
        return true;
    } catch (error) {
        console.error('❌ Failed to seed sample data:', error.message);
        return false;
    }
};

// Initialize database function
const initializeDatabase = async () => {
    try {
        console.log('🚀 Initializing RizeOS Job Portal Database...');
        
        // Test connection
        const connectionTest = await testConnection();
        if (!connectionTest) {
            throw new Error('Database connection failed');
        }
        
        // Initialize tables
        const tablesInit = await initializeTables();
        if (!tablesInit) {
            throw new Error('Table initialization failed');
        }
        
        // Seed sample data
        await seedSampleData();
        
        console.log('🎉 Database initialization completed successfully!');
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
    initializeTables,
    seedSampleData,
    initializeDatabase,
    closeConnection,
    sequelize // For compatibility with existing code
};
