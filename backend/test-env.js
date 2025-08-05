const path = require('path');
require('dotenv').config();

console.log('🔍 Environment Variable Test');
console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);
console.log('');
console.log('Environment variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***SET***' : 'NOT SET');

// Also try loading with explicit path
console.log('\n🔧 Trying explicit path...');
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('After explicit path:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
