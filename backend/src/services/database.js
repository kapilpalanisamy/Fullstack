const { Pool } = require('pg');
const config = require('../config/production');

const pool = new Pool({
  connectionString: config.database.url,
  ssl: config.database.ssl,
  ...config.database.pool
});

// Test database connection
const testConnection = async () => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Database connected successfully!');
    console.log(`   Time: ${result.rows[0].current_time}`);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  } finally {
    if (client) client.release();
  }
};

// Query helper
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: result.rows.length });
    return result;
  } catch (error) {
    console.error('Query error:', error.message);
    throw error;
  }
};

module.exports = {
  pool,
  query,
  testConnection
};
