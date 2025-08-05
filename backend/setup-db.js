const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function setupDatabase() {
    try {
        // Connect to Supabase PostgreSQL database
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        });

        await client.connect();
        console.log('Connected to Supabase PostgreSQL database');

        // Create tables
        await client.query(`
            CREATE TABLE IF NOT EXISTS companies (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                description TEXT,
                website VARCHAR(255),
                logo_url VARCHAR(255),
                industry VARCHAR(100),
                company_size VARCHAR(50),
                location VARCHAR(255),
                founded_year INTEGER,
                created_by UUID,
                is_verified BOOLEAN DEFAULT false,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL,
                bio TEXT,
                avatar_url VARCHAR(255),
                location VARCHAR(255),
                phone VARCHAR(50),
                website VARCHAR(255),
                linkedin_url VARCHAR(255),
                github_url VARCHAR(255),
                skills JSONB,
                experience_years INTEGER,
                wallet_address VARCHAR(255),
                email_verified BOOLEAN DEFAULT false,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS jobs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                company_id UUID REFERENCES companies(id),
                location VARCHAR(255) NOT NULL,
                job_type VARCHAR(50) NOT NULL,
                experience_level VARCHAR(50),
                salary_min INTEGER,
                salary_max INTEGER,
                salary_currency VARCHAR(10),
                application_deadline TIMESTAMP WITH TIME ZONE,
                is_active BOOLEAN DEFAULT true,
                is_featured BOOLEAN DEFAULT false,
                created_by UUID REFERENCES users(id),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS applications (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                job_id UUID REFERENCES jobs(id),
                user_id UUID REFERENCES users(id),
                status VARCHAR(50) DEFAULT 'pending',
                cover_letter TEXT,
                resume_url VARCHAR(255),
                feedback TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS saved_jobs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id),
                job_id UUID REFERENCES jobs(id),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, job_id)
            );
        `);

        console.log('Tables created successfully');
        await client.end();
        console.log('Database setup completed');

    } catch (err) {
        console.error('Error during database setup:');
        console.error('Error message:', err.message);
        if (err.code) console.error('Error code:', err.code);
        if (err.detail) console.error('Error detail:', err.detail);
        process.exit(1);
    }
}

setupDatabase();
