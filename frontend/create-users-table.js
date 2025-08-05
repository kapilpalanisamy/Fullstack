// Create users table in the database
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://postgres.ylikervxuyubfdomvnmz:Kk9ENWZ3m0H!@aws-0-ap-south-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function createUsersTable() {
  try {
    console.log('🔧 Creating users table...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        role VARCHAR(50) DEFAULT 'candidate',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Users table created successfully');
    
    // Check existing users
    const result = await pool.query('SELECT COUNT(*) FROM users');
    console.log('👥 Users in database:', result.rows[0].count);
    
    // List all tables to verify
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📋 All tables in database:');
    tables.rows.forEach(row => console.log('  -', row.table_name));
    
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error creating users table:', error.message);
    await pool.end();
  }
}

createUsersTable();
