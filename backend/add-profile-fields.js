const { Client } = require('pg');

async function addProfileFields() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    // Add experience and education fields if they don't exist
    console.log('📋 Adding profile fields...');
    
    try {
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS experience TEXT,
        ADD COLUMN IF NOT EXISTS education TEXT;
      `);
      console.log('✅ Added experience and education columns');
    } catch (error) {
      console.log('⚠️ Columns may already exist:', error.message);
    }

    // Check the updated structure
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('bio', 'location', 'linkedin_url', 'skills', 'experience', 'education', 'phone')
      ORDER BY column_name;
    `);

    console.log('📋 Profile-related columns:');
    columnsResult.rows.forEach(row => {
      console.log(`   ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

addProfileFields();
