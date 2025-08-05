require('dotenv').config();
const { Client } = require('pg');

async function checkTables() {
  console.log('🔍 Checking database tables...');
  
  const config = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
      rejectUnauthorized: false
    },
    family: 4,
  };

  const client = new Client(config);

  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // List all tables
    const result = await client.query(`
      SELECT table_name, table_schema 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('\n📊 Tables in database:');
    if (result.rows.length === 0) {
      console.log('❌ No tables found');
    } else {
      result.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    }
    
    // Also check for migration tracking table
    const migrationResult = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_name LIKE '%SequelizeMeta%' OR table_name LIKE '%sequelize%';
    `);
    
    console.log('\n🔄 Migration tracking tables:');
    if (migrationResult.rows.length === 0) {
      console.log('❌ No migration tracking tables found');
    } else {
      migrationResult.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    await client.end().catch(() => {});
  }
}

checkTables();
