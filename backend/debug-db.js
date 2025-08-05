/**
 * Debug Database Connection
 */

const { Pool } = require('pg');
require('dotenv').config();

console.log('🔍 Debugging database connection...');
console.log('Environment variables:');
console.log(`DB_HOST: ${process.env.DB_HOST}`);
console.log(`DB_PORT: ${process.env.DB_PORT}`);
console.log(`DB_NAME: ${process.env.DB_NAME}`);
console.log(`DB_USER: ${process.env.DB_USER}`);
console.log(`DB_PASSWORD: ${process.env.DB_PASSWORD ? '***********' : 'NOT SET'}`);

const dbConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
        rejectUnauthorized: false
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
};

console.log('\n🔧 Database config:');
console.log(JSON.stringify({...dbConfig, password: '***********'}, null, 2));

async function testConnection() {
    try {
        const pool = new Pool(dbConfig);
        
        console.log('\n🔌 Attempting connection...');
        const client = await pool.connect();
        const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
        
        console.log('✅ SUCCESS! Database connected!');
        console.log(`   Time: ${result.rows[0].current_time}`);
        console.log(`   Version: ${result.rows[0].pg_version.split(' ')[0]}`);
        
        client.release();
        await pool.end();
        
    } catch (error) {
        console.log('❌ FAILED! Database connection error:');
        console.log(`   Error: ${error.message}`);
        console.log(`   Code: ${error.code}`);
        console.log(`   Full error:`, error);
    }
}

testConnection();
