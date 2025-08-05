/**
 * RizeOS Job Portal Backend Setup Script
 * Comprehensive setup for development environment
 */

require('dotenv').config();
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up RizeOS Job Portal Backend...\n');

/**
 * Step 1: Environment Check
 */
console.log('📋 Step 1: Environment Check');
console.log('================================');

// Check Node.js version
const nodeVersion = process.version;
console.log(`✅ Node.js: ${nodeVersion}`);

// Check npm version
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  console.log(`✅ npm: v${npmVersion}`);
} catch (error) {
  console.log('❌ npm not found');
  process.exit(1);
}

// Check PostgreSQL
try {
  const pgVersion = execSync('pg_config --version', { encoding: 'utf8' }).trim();
  console.log(`✅ PostgreSQL: ${pgVersion}`);
} catch (error) {
  console.log('⚠️  PostgreSQL not found in PATH - please install PostgreSQL');
}

console.log('');

/**
 * Step 2: Dependencies Check
 */
console.log('📦 Step 2: Dependencies Check');
console.log('==============================');

if (!fs.existsSync('node_modules')) {
  console.log('📥 Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully');
  } catch (error) {
    console.log('❌ Failed to install dependencies');
    process.exit(1);
  }
} else {
  console.log('✅ Dependencies already installed');
}

console.log('');

/**
 * Step 3: Environment Configuration
 */
console.log('⚙️  Step 3: Environment Configuration');
console.log('====================================');

if (!fs.existsSync('.env')) {
  console.log('📝 Creating .env file from template...');
  fs.copyFileSync('.env.example', '.env');
  console.log('✅ .env file created');
  console.log('⚠️  Please update .env with your actual configuration values');
} else {
  console.log('✅ .env file already exists');
}

console.log('');

/**
 * Step 4: Directory Structure
 */
console.log('📁 Step 4: Directory Structure');
console.log('==============================');

const directories = [
  'logs',
  'uploads',
  'src/database/seeders'
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  } else {
    console.log(`✅ Directory exists: ${dir}`);
  }
});

console.log('');

/**
 * Step 5: Database Setup Instructions
 */
console.log('🗄️  Step 5: Database Setup');
console.log('==========================');

console.log('To set up your database:');
console.log('1. Make sure PostgreSQL is running');
console.log('2. Create the database:');
console.log('   createdb rize_job_portal');
console.log('3. Run migrations:');
console.log('   npm run db:migrate');
console.log('4. (Optional) Seed sample data:');
console.log('   npm run db:seed');

console.log('');

/**
 * Step 6: Test Backend
 */
console.log('🧪 Step 6: Testing Backend');
console.log('==========================');

try {
  console.log('Running backend tests...');
  execSync('npm test', { stdio: 'inherit' });
} catch (error) {
  console.log('⚠️  Some tests failed - this is normal if database is not set up yet');
}

console.log('');

/**
 * Final Instructions
 */
console.log('🎉 Setup Complete!');
console.log('==================');
console.log('');
console.log('Next steps:');
console.log('1. Update your .env file with actual values');
console.log('2. Set up PostgreSQL database:');
console.log('   createdb rize_job_portal');
console.log('3. Run database migrations:');
console.log('   npm run db:migrate');
console.log('4. Start the development server:');
console.log('   npm run dev');
console.log('');
console.log('🌐 Your backend will be available at: http://localhost:5000');
console.log('📖 Health check: http://localhost:5000/health');
console.log('📋 API docs: http://localhost:5000/api/v1');
console.log('');
console.log('Happy coding! 🚀');
