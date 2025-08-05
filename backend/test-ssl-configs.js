// Test connection with different SSL and authentication options
const { Sequelize } = require('sequelize');

console.log('🔍 Testing connection with various SSL configurations...\n');

const baseUrl = 'postgresql://postgres.ylikervxuyubfdomvnmz:Kapil94433@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';

const configurations = [
  {
    name: 'Standard SSL',
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
    name: 'No SSL Verification',
    options: {
      dialect: 'postgres',
      dialectOptions: {
        ssl: false
      },
      logging: false
    }
  },
  {
    name: 'SSL with specific options',
    options: {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
          ca: false,
          checkServerIdentity: false
        }
      },
      logging: false
    }
  },
  {
    name: 'Connection with timeout adjustments',
    options: {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        },
        connectTimeout: 30000,
        idle_in_transaction_session_timeout: 30000
      },
      pool: {
        max: 1,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      logging: false
    }
  }
];

async function testConfiguration(config) {
  console.log(`\n🧪 Testing: ${config.name}`);
  console.log('─'.repeat(50));
  
  try {
    const sequelize = new Sequelize(baseUrl, config.options);
    
    console.log('⏳ Attempting connection...');
    await sequelize.authenticate();
    console.log('✅ Authentication successful!');
    
    // Test basic query
    const [results] = await sequelize.query('SELECT current_database(), current_user, version()');
    console.log('✅ Query execution successful!');
    console.log(`📊 Database: ${results[0].current_database}`);
    console.log(`👤 User: ${results[0].current_user}`);
    console.log(`📝 Version: ${results[0].version.split(' ')[0]}`);
    
    await sequelize.close();
    console.log('🎉 Configuration works! Use this one.');
    return true;
    
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
    return false;
  }
}

async function findWorkingConfiguration() {
  console.log('🎯 Finding working database configuration...');
  
  for (const config of configurations) {
    const success = await testConfiguration(config);
    if (success) {
      console.log('\n🏆 FOUND WORKING CONFIGURATION!');
      console.log('Use this configuration in your database.js file');
      return;
    }
  }
  
  console.log('\n😞 None of the configurations worked.');
  console.log('\n🔧 Manual steps to try:');
  console.log('1. Check Supabase dashboard for project status');
  console.log('2. Verify your project is not paused/suspended');
  console.log('3. Try resetting the database password');
  console.log('4. Check if your IP is whitelisted (if required)');
  console.log('5. Try connecting from a different network');
}

findWorkingConfiguration();
