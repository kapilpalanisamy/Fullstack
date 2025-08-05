const { Client } = require('pg');

async function checkTestUser() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    const result = await client.query('SELECT id, name, email FROM users WHERE email = $1', ['test@example.com']);
    
    if (result.rows.length > 0) {
      console.log('👤 Test User Found:');
      console.log('   ID:', result.rows[0].id);
      console.log('   Name:', result.rows[0].name);
      console.log('   Email:', result.rows[0].email);
    } else {
      console.log('❌ Test user not found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

checkTestUser();
