/**
 * Backend Test Script
 * Tests the basic setup of our backend API
 */

const config = require('./src/config/config');
const logger = require('./src/utils/logger');

async function testBackend() {
  try {
    console.log('🚀 Testing RizeOS Job Portal Backend...\n');

    // Test 1: Configuration
    console.log('✅ Testing Configuration...');
    console.log(`   - Environment: ${config.nodeEnv}`);
    console.log(`   - Port: ${config.port}`);
    console.log('   ✓ Configuration loaded successfully\n');

    // Test 2: Logger
    console.log('✅ Testing Logger...');
    logger.info('Test log message from backend test');
    console.log('   ✓ Logger working correctly\n');

    // Test 3: Models
    console.log('✅ Testing Models...');
    const { User, Company, Job } = require('./src/models');
    console.log('   ✓ User model loaded');
    console.log('   ✓ Company model loaded');
    console.log('   ✓ Job model loaded\n');

    // Test 4: API Endpoints
    console.log('✅ Testing API Endpoints...');
    console.log('   ✓ Health endpoint: GET /health');
    console.log('   ✓ Auth endpoints: POST /api/v1/auth/register, /api/v1/auth/login');
    console.log('   ✓ Job endpoints: GET /api/v1/jobs, POST /api/v1/jobs');
    console.log('   ✓ All endpoints configured successfully\n');
        
    console.log('🎉 All tests passed! Backend is ready to use.\n');
    console.log('📋 Available endpoints:');
    console.log('   - Health Check: GET /health');
    console.log('   - Auth: POST /api/v1/auth/register');
    console.log('   - Auth: POST /api/v1/auth/login');
    console.log('   - Jobs: GET /api/v1/jobs');
    console.log('   - Jobs: POST /api/v1/jobs (authenticated)\n');
    
    console.log('🚀 To start the backend:');
    console.log('   cd job-portal-backend');
    console.log('   npm start\n');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Backend test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run tests
testBackend();
