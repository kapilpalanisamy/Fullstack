const { Pool } = require('pg');
require('dotenv').config();

console.log('🔧 Testing Supabase connection with different configurations...\n');

// Configuration 1: Standard SSL
const config1 = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
        rejectUnauthorized: false
    },
    max: 1,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
};

// Configuration 2: No SSL (fallback)
const config2 = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: false,
    max: 1,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
};

// Configuration 3: Prefer SSL
const config3 = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
        rejectUnauthorized: false,
        sslmode: 'prefer'
    },
    max: 1,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
};

// Configuration 4: Connection string approach
const config4 = {
    connectionString: process.env.DB_URL,
    ssl: {
        rejectUnauthorized: false
    },
    max: 1,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
};

async function testConnection(config, name) {
    console.log(`\n🧪 Testing ${name}:`);
    const pool = new Pool(config);
    
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
        console.log(`✅ ${name} - SUCCESS!`);
        console.log(`   Time: ${result.rows[0].current_time}`);
        console.log(`   Version: ${result.rows[0].pg_version.split(' ')[0]}`);
        client.release();
        await pool.end();
        return true;
    } catch (error) {
        console.log(`❌ ${name} - FAILED:`);
        console.log(`   Error: ${error.message}`);
        await pool.end();
        return false;
    }
}

async function main() {
    console.log('Database details:');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`Port: ${process.env.DB_PORT}`);
    console.log(`Database: ${process.env.DB_NAME}`);
    console.log(`User: ${process.env.DB_USER}`);
    console.log(`Password: ${'*'.repeat(process.env.DB_PASSWORD?.length || 0)}`);
    
    const configs = [
        [config4, 'Connection String with SSL'],
        [config1, 'Direct Config with SSL'],
        [config3, 'Prefer SSL Mode'],
        [config2, 'No SSL (fallback)']
    ];
    
    let success = false;
    for (const [config, name] of configs) {
        const result = await testConnection(config, name);
        if (result && !success) {
            success = true;
            console.log(`\n🎉 Found working configuration: ${name}`);
            break;
        }
    }
    
    if (!success) {
        console.log('\n❌ All connection attempts failed!');
        console.log('\n🔍 Troubleshooting suggestions:');
        console.log('1. Verify Supabase project is active');
        console.log('2. Check if your Supabase project has pooling enabled');
        console.log('3. Try connecting directly to port 5432 instead of 6543');
        console.log('4. Verify your database credentials in Supabase dashboard');
        console.log('5. Check if your IP is whitelisted (should be 0.0.0.0/0 for development)');
    }
}

main().catch(console.error);
