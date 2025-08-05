const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Pool } = require('pg');

// Print environment check
console.log('Environment Check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('Connection string:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':***@'));

// Create database configuration
const dbConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
        sslmode: 'require'
    }
};

async function testConnection() {
    const pool = new Pool(dbConfig);
    
    try {
        console.log('\nAttempting to connect to database...');
        const client = await pool.connect();
        console.log('✅ Successfully connected!');
        
        // Test a simple query
        const result = await client.query('SELECT NOW() as current_time');
        console.log('Current database time:', result.rows[0].current_time);
        
        // List tables
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        
        console.log('\nAvailable tables:');
        tables.rows.forEach(table => {
            console.log('-', table.table_name);
        });
        
        client.release();
        console.log('\n✅ All tests passed successfully!');
        
    } catch (err) {
        console.error('\n❌ Connection error:');
        console.error('Message:', err.message);
        console.error('Code:', err.code);
        if (err.code === 'ENOTFOUND') {
            console.error('Hint: Check if the database host is correct');
        } else if (err.code === 'ECONNREFUSED') {
            console.error('Hint: Check if the database is accepting connections');
        } else if (err.code === '28P01') {
            console.error('Hint: Check if the database password is correct');
        }
    } finally {
        await pool.end();
    }
}

// Run the test
testConnection().catch(console.error);
