// Advanced Database Connection Test
const { Sequelize } = require('sequelize');

console.log('🔍 Advanced Database Connection Test...\n');

// Test different connection configurations
const configs = [
  {
    name: 'Transaction Pooler (Current)',
    url: 'postgresql://postgres.ylikervxuyubfdomvnmz:Kapil9443344@aws-0-ap-south-1.pooler.supabase.com:6543/postgres',
    options: {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      logging: false
    }
  },
  {
    name: 'Direct Connection',
    url: 'postgresql://postgres.ylikervxuyubfdomvnmz:Kapil9443344@aws-0-ap-south-1.pooler.supabase.com:5432/postgres',
    options: {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      logging: false
    }
  },
  {
    name: 'Session Mode with PgBouncer',
    url: 'postgresql://postgres.ylikervxuyubfdomvnmz:Kapil9443344@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true',
    options: {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      logging: false
    }
  }
];

async function testConnection(config) {
  console.log(`Testing: ${config.name}`);
  console.log(`URL: ${config.url.replace(/:([^:@]*?)@/, ':***@')}`);
  
  try {
    const sequelize = new Sequelize(config.url, config.options);
    await sequelize.authenticate();
    console.log('✅ Connection successful!');
    
    // Test a simple query
    const result = await sequelize.query('SELECT version()');
    console.log(`📝 Database version: ${result[0][0].version.split(' ')[0]}`);
    
    await sequelize.close();
    return true;
  } catch (error) {
    console.log(`❌ Connection failed: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Testing different connection methods...\n');
  
  for (const config of configs) {
    console.log('─'.repeat(60));
    const success = await testConnection(config);
    if (success) {
      console.log('🎉 Found working connection!');
      break;
    }
  }
  
  console.log('\n💡 If all tests fail, check:');
  console.log('   1. Password is correct (Kapil9443344)');
  console.log('   2. Network/firewall not blocking connection');
  console.log('   3. Supabase service status');
  console.log('\n🔧 Visit Supabase dashboard to verify:');
  console.log('   https://supabase.com/dashboard/projects');
}

runTests().catch(console.error);
