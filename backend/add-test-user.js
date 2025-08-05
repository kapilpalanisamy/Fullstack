// Add Test User to Database
const { Client } = require('pg'); // Use Client instead of Pool for better control
const { v4: uuidv4 } = require('uuid'); // For generating UUIDs

// Try with connection string approach and proper encoding
const connectionString = `postgresql://postgres.ylikervxuyubfdomvnmz:${encodeURIComponent('Kapilpalanisamy')}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`;

const dbConfig = {
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 30000,
};

async function addTestUser() {
  const client = new Client(dbConfig);
  
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    // Check table structure first
    console.log('🔍 Checking users table structure...');
    const tableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Table Structure:');
    tableInfo.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default || 'none'})`);
    });
    console.log('');

    // Test user credentials
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123', // Simple password for testing
      role: 'jobseeker' // Changed from 'candidate' to match enum
    };

    console.log('👤 Adding test user...');
    console.log('📧 Email:', testUser.email);
    console.log('🔐 Password:', testUser.password);
    console.log('👔 Role:', testUser.role);

    // Check if user already exists
    const existingUser = await client.query('SELECT * FROM users WHERE email = $1', [testUser.email]);
    
    if (existingUser.rows.length > 0) {
      console.log('⚠️ User already exists!');
      console.log('✅ You can login with:');
      console.log('   Email: test@example.com');
      console.log('   Password: password123');
      return;
    }

    // Insert new user with minimal required fields
    const userId = uuidv4();
    const result = await client.query(`
      INSERT INTO users (id, name, email, role, password, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `, [userId, testUser.name, testUser.email, testUser.role, testUser.password]);

    const newUser = result.rows[0];
    console.log('✅ Test user created successfully!');
    console.log('📋 User Details:');
    console.log('   ID:', newUser.id);
    console.log('   Name:', newUser.name);
    console.log('   Email:', newUser.email);
    console.log('   Role:', newUser.role);
    console.log('   Created:', newUser.created_at);
    console.log('');
    console.log('🎯 LOGIN CREDENTIALS:');
    console.log('   Email: test@example.com');
    console.log('   Password: password123');
    console.log('');
    console.log('🚀 You can now login to the frontend with these credentials!');

  } catch (error) {
    console.error('❌ Error adding test user:', error.message);
    
    // If role enum error, try with different roles
    if (error.message.includes('enum')) {
      console.log('🔄 Trying with different role...');
      try {
        const result = await client.query(`
          INSERT INTO users (name, email, role, created_at, is_active, email_verified)
          VALUES ($1, $2, 'recruiter', NOW(), true, true)
          RETURNING id, name, email, role, created_at
        `, [testUser.name, testUser.email]);

        const newUser = result.rows[0];
        console.log('✅ Test user created with recruiter role!');
        console.log('🎯 LOGIN CREDENTIALS:');
        console.log('   Email: test@example.com');
        console.log('   Password: password123');
        console.log('   Role: recruiter');
      } catch (retryError) {
        console.error('❌ Retry failed:', retryError.message);
      }
    }
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

addTestUser();
