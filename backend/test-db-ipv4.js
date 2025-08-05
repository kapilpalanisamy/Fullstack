require('dotenv').config();
const { Client } = require('pg');

async function testConnection() {
  console.log('🔍 Testing database connection with IPv4 enforcement...');
  
  const config = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
      rejectUnauthorized: false
    },
    // Force IPv4
    family: 4,
    connectTimeout: 10000,
    query_timeout: 5000,
    statement_timeout: 5000,
  };

  console.log('Host:', config.host);
  console.log('Port:', config.port);
  console.log('Database:', config.database);
  console.log('User:', config.user);
  console.log('SSL: enabled');
  console.log('IPv4: enforced');

  const client = new Client(config);

  try {
    console.log('\n⏳ Attempting to connect...');
    await client.connect();
    console.log('✅ Database connected successfully!');
    
    console.log('\n🔍 Testing query...');
    const result = await client.query('SELECT version(), now() as current_time;');
    console.log('✅ Query successful!');
    console.log('PostgreSQL Version:', result.rows[0].version.split(' ')[0]);
    console.log('Current Time:', result.rows[0].current_time);
    
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n🔧 DNS Resolution Issue Detected:');
      console.log('- The hostname cannot be resolved');
      console.log('- This might be due to network or DNS configuration');
      console.log('- Try using the Session pooler connection instead');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 Connection Refused:');
      console.log('- The server is not accepting connections on this port');
      console.log('- Try the direct connection port (5432) instead of pooler (6543)');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('\n🔧 Connection Timeout:');
      console.log('- Network connectivity issues or firewall blocking');
      console.log('- Try different connection method or check network settings');
    }
    
    console.log('\nConnection string attempted:');
    console.log(`postgresql://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`);
  } finally {
    await client.end().catch(() => {});
  }
}

testConnection();
