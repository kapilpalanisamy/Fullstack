const { query } = require('./src/config/database');

async function checkTables() {
    try {
        console.log('📋 Checking table structures...\n');
        
        // Check companies table
        const companiesColumns = await query(`
            SELECT column_name, data_type, is_nullable, column_default 
            FROM information_schema.columns 
            WHERE table_name = 'companies' 
            ORDER BY ordinal_position
        `);
        
        console.log('Companies table columns:');
        console.table(companiesColumns.rows);
        
        // Check users table 
        const usersColumns = await query(`
            SELECT column_name, data_type, is_nullable, column_default 
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            ORDER BY ordinal_position
        `);
        
        console.log('\nUsers table columns:');
        console.table(usersColumns.rows);
        
        // Check existing constraints
        const constraints = await query(`
            SELECT constraint_name, table_name, constraint_type 
            FROM information_schema.table_constraints 
            WHERE table_name IN ('companies', 'users', 'jobs', 'applications', 'saved_jobs')
            ORDER BY table_name, constraint_name
        `);
        
        console.log('\nExisting constraints:');
        console.table(constraints.rows);
        
    } catch (error) {
        console.error('Error checking tables:', error.message);
    }
    
    process.exit(0);
}

checkTables();
