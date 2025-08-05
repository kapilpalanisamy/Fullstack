// Simple PostgreSQL connection test without Sequelize
const { Client } = require('pg');

console.log('🔍 Testing PostgreSQL connection directly...\n');

const client = new Client({
  host: 'aws-0-ap-south-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.ylikervxuyubfdomvnmz',
  password: 'Kapil94433@',
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    console.log('📊 Running test query...');
    const result = await client.query('SELECT NOW() as current_time, version()');
    console.log('✅ Query successful!');
    console.log(`📅 Server time: ${result.rows[0].current_time}`);
    console.log(`🗄️  Version: ${result.rows[0].version.split(' ')[0]}`);
    
    await client.end();
    console.log('✅ Database connection is working perfectly!');
    
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code}`);
    
    if (error.message.includes('SASL')) {
      console.log('\n💡 SASL authentication error suggests:');
      console.log('   1. Password may have been reset');
      console.log('   2. Account credentials need refreshing');
      console.log('   3. Visit Supabase dashboard to get new credentials');
    }
  }
}

testConnection();
