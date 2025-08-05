-- RizeOS Job Portal Database Initialization
-- PostgreSQL initialization script

-- Create database (if running manually)
-- CREATE DATABASE rize_job_portal;

-- Connect to database
\c rize_job_portal;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
DO $$ 
BEGIN
    -- User roles
    CREATE TYPE user_role AS ENUM ('jobseeker', 'recruiter', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ 
BEGIN
    -- Job types
    CREATE TYPE job_type AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'REMOTE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ 
BEGIN
    -- Experience levels
    CREATE TYPE experience_level AS ENUM ('ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ 
BEGIN
    -- Job status
    CREATE TYPE job_status AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'CLOSED', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ 
BEGIN
    -- Application status
    CREATE TYPE application_status AS ENUM ('PENDING', 'REVIEWED', 'INTERVIEWED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ 
BEGIN
    -- Payment status
    CREATE TYPE payment_status AS ENUM ('PENDING', 'CONFIRMED', 'FAILED', 'REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ 
BEGIN
    -- Payment types
    CREATE TYPE payment_type AS ENUM ('JOB_POSTING', 'PREMIUM_LISTING', 'FEATURED_JOB');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ 
BEGIN
    -- Company sizes
    CREATE TYPE company_size AS ENUM ('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create indexes after tables are created by Sequelize
-- These will be added after migration

-- Performance optimization function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create search configuration for full-text search
CREATE TEXT SEARCH CONFIGURATION IF NOT EXISTS job_search (COPY = english);

-- Grant permissions
-- GRANT ALL PRIVILEGES ON DATABASE rize_job_portal TO postgres;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Initial admin user will be created via seeder
COMMENT ON DATABASE rize_job_portal IS 'RizeOS Job Portal - Production Database';

-- Success message
\echo 'Database initialization completed successfully!'
\echo 'Next steps:'
\echo '1. Run migrations: npm run db:migrate'
\echo '2. Run seeders: npm run db:seed'
\echo '3. Start the application: npm start'
