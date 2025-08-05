/**
 * Database Schema Inspector
 */

const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

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

async function inspectDatabase() {
    const pool = new Pool(dbConfig);
    
    try {
        console.log('🔍 Inspecting database schema...\n');
        
        // Check what tables exist
        const tablesResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        
        console.log('📋 Available tables:');
        if (tablesResult.rows.length === 0) {
            console.log('   No tables found in database');
        } else {
            tablesResult.rows.forEach(row => {
                console.log(`   - ${row.table_name}`);
            });
        }
        
        // If jobs table exists, check its columns
        const jobsTableExists = tablesResult.rows.some(row => row.table_name === 'jobs');
        if (jobsTableExists) {
            console.log('\n📊 Jobs table columns:');
            const jobsColumns = await pool.query(`
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns 
                WHERE table_name = 'jobs'
                ORDER BY ordinal_position
            `);
            
            jobsColumns.rows.forEach(col => {
                console.log(`   - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
            });
        }
        
        // If companies table exists, check its columns
        const companiesTableExists = tablesResult.rows.some(row => row.table_name === 'companies');
        if (companiesTableExists) {
            console.log('\n🏢 Companies table columns:');
            const companiesColumns = await pool.query(`
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns 
                WHERE table_name = 'companies'
                ORDER BY ordinal_position
            `);
            
            companiesColumns.rows.forEach(col => {
                console.log(`   - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
            });
        }
        
        // If users table exists, check its columns
        const usersTableExists = tablesResult.rows.some(row => row.table_name === 'users');
        if (usersTableExists) {
            console.log('\n👥 Users table columns:');
            const usersColumns = await pool.query(`
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns 
                WHERE table_name = 'users'
                ORDER BY ordinal_position
            `);
            
            usersColumns.rows.forEach(col => {
                console.log(`   - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error inspecting database:', error.message);
    } finally {
        await pool.end();
    }
}

inspectDatabase();
