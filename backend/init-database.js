#!/usr/bin/env node

/**
 * Database Initialization Script
 * Sets up the database with tables and sample data
 */

const { initializeDatabase } = require('./src/config/database');

async function main() {
    console.log('🚀 Starting RizeOS Job Portal Database Setup...\n');
    
    try {
        await initializeDatabase();
        console.log('\n🎉 Database setup completed successfully!');
        console.log('✅ Your backend is now ready to handle requests.');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Database setup failed:', error.message);
        console.log('\n🔧 Troubleshooting steps:');
        console.log('1. Verify your .env file has correct database credentials');
        console.log('2. Ensure your Supabase project is active');
        console.log('3. Check network connectivity');
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n👋 Database setup interrupted by user');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n\n👋 Database setup terminated');
    process.exit(0);
});

main();
