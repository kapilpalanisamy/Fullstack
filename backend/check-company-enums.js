const { Client } = require('pg');

async function checkCompanyEnums() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    // Check company_size enum values
    const enumResult = await client.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid 
        FROM pg_type 
        WHERE typname = 'company_size_enum'
      )
      ORDER BY enumsortorder;
    `);

    console.log('📋 Company Size Enum Values:');
    enumResult.rows.forEach(row => {
      console.log(`   - ${row.enumlabel}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

checkCompanyEnums();
