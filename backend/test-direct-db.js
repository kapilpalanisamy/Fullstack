// Simple database connection test for debugging
const { Pool } = require('pg');
require('dotenv').config();

// Exact configuration that works
const dbConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
        rejectUnauthorized: false
    }
};

async function testDirectConnection() {
    console.log('🧪 Testing direct database connection...');
    console.log('Config:', {
        host: dbConfig.host,
        port: dbConfig.port,
        database: dbConfig.database,
        user: dbConfig.user,
        password: '***'
    });
    
    const pool = new Pool(dbConfig);
    
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
        console.log('✅ Direct connection successful!');
        console.log(`   Time: ${result.rows[0].current_time}`);
        console.log(`   Version: ${result.rows[0].pg_version.split(' ')[0]}`);
        client.release();
        await pool.end();
        return true;
    } catch (error) {
        console.error('❌ Direct connection failed:', error.message);
        await pool.end();
        return false;
    }
}

testDirectConnection();
