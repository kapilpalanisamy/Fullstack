const { Client } = require('pg');

async function checkAllEnums() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    // Check all custom enum types
    const enumTypesResult = await client.query(`
      SELECT t.typname, e.enumlabel
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid 
      WHERE t.typtype = 'e'
      ORDER BY t.typname, e.enumsortorder;
    `);

    console.log('📋 All Enum Types:');
    let currentType = null;
    enumTypesResult.rows.forEach(row => {
      if (row.typname !== currentType) {
        currentType = row.typname;
        console.log(`\n${row.typname}:`);
      }
      console.log(`   - ${row.enumlabel}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

checkAllEnums();
