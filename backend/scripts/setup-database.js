#!/usr/bin/env node

const { Client } = require('pg');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

class DatabaseSetup {
  constructor() {
    this.dbConfig = {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'rize_job_portal'
    };
    
    // Admin connection (without database)
    this.adminConfig = {
      user: this.dbConfig.user,
      host: this.dbConfig.host,
      port: this.dbConfig.port,
      password: this.dbConfig.password,
      database: 'postgres' // Default postgres database
    };
  }

  async checkPostgreSQL() {
    console.log('🔍 Checking PostgreSQL connection...');
    try {
      const client = new Client(this.adminConfig);
      await client.connect();
      const result = await client.query('SELECT version()');
      console.log(`✅ PostgreSQL connected: ${result.rows[0].version.split(' ').slice(0, 2).join(' ')}`);
      await client.end();
      return true;
    } catch (error) {
      console.error('❌ PostgreSQL connection failed:', error.message);
      console.log('\n📋 To install PostgreSQL:');
      console.log('   Windows: Download from https://www.postgresql.org/download/windows/');
      console.log('   macOS: brew install postgresql');
      console.log('   Ubuntu: sudo apt-get install postgresql postgresql-contrib');
      return false;
    }
  }

  async createDatabase() {
    console.log(`🔧 Creating database: ${this.dbConfig.database}`);
    try {
      const client = new Client(this.adminConfig);
      await client.connect();
      
      // Check if database exists
      const dbExists = await client.query(
        'SELECT 1 FROM pg_database WHERE datname = $1',
        [this.dbConfig.database]
      );
      
      if (dbExists.rows.length > 0) {
        console.log(`✅ Database '${this.dbConfig.database}' already exists`);
      } else {
        await client.query(`CREATE DATABASE "${this.dbConfig.database}"`);
        console.log(`✅ Database '${this.dbConfig.database}' created successfully`);
      }
      
      await client.end();
      return true;
    } catch (error) {
      console.error('❌ Database creation failed:', error.message);
      return false;
    }
  }

  async runInitScript() {
    console.log('🏗️  Running database initialization script...');
    try {
      const initPath = path.join(__dirname, '..', 'init.sql');
      if (!fs.existsSync(initPath)) {
        console.log('⚠️  init.sql not found, skipping initialization script');
        return true;
      }

      // Use psql to run the init script
      const psqlCommand = `psql -h ${this.dbConfig.host} -p ${this.dbConfig.port} -U ${this.dbConfig.user} -d ${this.dbConfig.database} -f "${initPath}"`;
      
      console.log('Running:', psqlCommand);
      execSync(psqlCommand, { 
        stdio: 'inherit',
        env: { ...process.env, PGPASSWORD: this.dbConfig.password }
      });
      
      console.log('✅ Database initialization completed');
      return true;
    } catch (error) {
      console.error('❌ Initialization script failed:', error.message);
      console.log('💡 You can run the init.sql manually with psql');
      return false;
    }
  }

  async runMigrations() {
    console.log('🔄 Running database migrations...');
    try {
      execSync('npm run db:migrate', { stdio: 'inherit' });
      console.log('✅ Migrations completed successfully');
      return true;
    } catch (error) {
      console.error('❌ Migrations failed:', error.message);
      return false;
    }
  }

  async runSeeders() {
    console.log('🌱 Running database seeders...');
    try {
      execSync('npm run db:seed', { stdio: 'inherit' });
      console.log('✅ Seeders completed successfully');
      return true;
    } catch (error) {
      console.error('❌ Seeders failed:', error.message);
      console.log('💡 You can run seeders later with: npm run db:seed');
      return false;
    }
  }

  async testConnection() {
    console.log('🧪 Testing application database connection...');
    try {
      const client = new Client(this.dbConfig);
      await client.connect();
      
      // Test basic query
      const result = await client.query('SELECT NOW() as current_time');
      console.log(`✅ Connection test successful: ${result.rows[0].current_time}`);
      
      // Check if tables exist
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);
      
      if (tablesResult.rows.length > 0) {
        console.log(`✅ Found ${tablesResult.rows.length} tables:`, 
          tablesResult.rows.map(row => row.table_name).join(', '));
      } else {
        console.log('⚠️  No tables found - migrations may not have run');
      }
      
      await client.end();
      return true;
    } catch (error) {
      console.error('❌ Connection test failed:', error.message);
      return false;
    }
  }

  async setup() {
    console.log('🚀 Starting Database Setup for RizeOS Job Portal\n');
    console.log('Database Configuration:');
    console.log(`   Host: ${this.dbConfig.host}:${this.dbConfig.port}`);
    console.log(`   User: ${this.dbConfig.user}`);
    console.log(`   Database: ${this.dbConfig.database}\n`);

    let success = true;

    // Step 1: Check PostgreSQL
    if (!await this.checkPostgreSQL()) {
      return false;
    }

    // Step 2: Create database
    if (!await this.createDatabase()) {
      success = false;
    }

    // Step 3: Run init script
    if (!await this.runInitScript()) {
      success = false;
    }

    // Step 4: Run migrations
    if (!await this.runMigrations()) {
      success = false;
    }

    // Step 5: Run seeders
    if (!await this.runSeeders()) {
      success = false;
    }

    // Step 6: Test connection
    if (!await this.testConnection()) {
      success = false;
    }

    console.log('\n' + '='.repeat(50));
    if (success) {
      console.log('🎉 Database setup completed successfully!');
      console.log('\nNext steps:');
      console.log('1. Start the backend: npm run dev');
      console.log('2. Test the API endpoints');
      console.log('3. Start the frontend application');
      console.log('\n💡 Admin credentials:');
      console.log('   Email: admin@rizeportal.com');
      console.log('   Password: admin123!@#');
    } else {
      console.log('⚠️  Database setup completed with some errors');
      console.log('Please check the logs above and resolve any issues');
    }
    console.log('='.repeat(50));

    return success;
  }
}

// Run setup if called directly
if (require.main === module) {
  const setup = new DatabaseSetup();
  setup.setup()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Setup failed with error:', error.message);
      process.exit(1);
    });
}

module.exports = DatabaseSetup;
