#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🚀 RizeOS Job Portal - Quick Start');
console.log('Setting up your development environment...\n');

try {
  // Check Node.js version
  console.log('📋 Checking requirements...');
  const nodeVersion = process.version;
  console.log(`✅ Node.js: ${nodeVersion}`);

  // Check if PostgreSQL is available
  try {
    execSync('psql --version', { stdio: 'ignore' });
    console.log('✅ PostgreSQL: Available');
  } catch (error) {
    console.log('❌ PostgreSQL: Not found');
    console.log('   Please install PostgreSQL from https://www.postgresql.org/download/');
  }

  // Install dependencies
  console.log('\n📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed');

  // Check environment
  console.log('\n⚙️  Checking environment...');
  const fs = require('fs');
  if (!fs.existsSync('.env')) {
    if (fs.existsSync('.env.example')) {
      fs.copyFileSync('.env.example', '.env');
      console.log('✅ Created .env from template');
      console.log('   Please edit .env with your configuration');
    } else {
      console.log('   No .env file found - please create one');
    }
  } else {
    console.log('✅ Environment file exists');
  }

  // Run deployment check
  console.log('\n🔍 Running deployment check...');
  execSync('node deploy-setup.js', { stdio: 'inherit' });

  // Success message
  console.log('\n🎉 Quick Start Complete!');
  console.log('\n📋 Next Steps:');
  console.log('1. Edit .env file with your database credentials');
  console.log('2. Run: npm run db:setup (to setup database)');
  console.log('3. Run: npm run dev (to start development server)');
  console.log('4. Test API: http://localhost:3000/health');
  
  console.log('\n🔧 Available Scripts:');
  console.log('   npm run dev          - Start development server');
  console.log('   npm run db:setup     - Setup database completely');
  console.log('   npm run deploy:check - Check deployment readiness');
  console.log('   npm run docker:run   - Run with Docker');

  console.log('\n📚 Default Test Credentials:');
  console.log('   Admin: admin@rizeportal.com / admin123!@#');
  console.log('   Recruiter: recruiter@google.com / recruiter123');
  console.log('   Job Seeker: jobseeker1@example.com / jobseeker123');

} catch (error) {
  console.error('\n❌ Quick start failed:', error.message);
  console.log('\n💡 Manual setup:');
  console.log('1. npm install');
  console.log('2. Copy .env.example to .env');
  console.log('3. Edit .env with your configuration');
  console.log('4. npm run db:setup');
  console.log('5. npm run dev');
}
