require('dotenv').config();
const { Client } = require('pg');

async function testConnection() {
  console.log('🔍 Testing database connection...');
  console.log('Host:', process.env.DB_HOST);
  console.log('Database:', process.env.DB_NAME);
  console.log('User:', process.env.DB_USER);
  
  const client = new Client({
    connectionString: process.env.DB_URL
  });

  try {
    await client.connect();
    console.log('✅ Database connected successfully!');
    
    const result = await client.query('SELECT version()');
    console.log('Database version:', result.rows[0].version);
    
    await client.end();
    console.log('✅ Connection test complete!');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Connection string:', process.env.DB_URL);
  }
}

testConnection();
