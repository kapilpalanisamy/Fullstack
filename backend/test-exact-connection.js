// Test the exact connection string format
const { Sequelize } = require('sequelize');

console.log('🔍 Testing exact connection string format...\n');

const connectionString = 'postgresql://postgres.ylikervxuyubfdomvnmz:Kapil94433@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';

async function testConnection() {
  try {
    console.log('🔌 Testing connection string:');
    console.log(connectionString.replace(/:([^:@]*?)@/, ':***@'));
    
    const sequelize = new Sequelize(connectionString, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      logging: false
    });
    
    console.log('⏳ Attempting connection...');
    await sequelize.authenticate();
    console.log('✅ Connection successful!');
    
    // Test a simple query
    const [results] = await sequelize.query('SELECT version(), current_database(), current_user');
    console.log('\n📊 Connection Details:');
    console.log(`   Database: ${results[0].current_database}`);
    console.log(`   User: ${results[0].current_user}`);
    console.log(`   Version: ${results[0].version.split(' ')[0]}`);
    
    await sequelize.close();
    console.log('\n🎉 Database connection is working perfectly!');
    return true;
    
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code || 'Unknown'}`);
    
    if (error.message.includes('SASL')) {
      console.log('\n💡 Authentication issue detected. Try these steps:');
      console.log('   1. Visit https://supabase.com/dashboard/projects');
      console.log('   2. Go to Settings → Database');
      console.log('   3. Reset database password if needed');
      console.log('   4. Copy the new connection string');
    } else if (error.message.includes('timeout')) {
      console.log('\n💡 Connection timeout. Check:');
      console.log('   1. Internet connection');
      console.log('   2. Firewall settings');
      console.log('   3. Supabase service status');
    }
    
    return false;
  }
}

testConnection();
