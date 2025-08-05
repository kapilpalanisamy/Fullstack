require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Testing Supabase connection using Supabase client...');

// Extract project details from the connection string
const connectionString = process.env.DB_URL;
console.log('Connection string:', connectionString);

// Try to extract Supabase URL and anon key approach
const hostMatch = connectionString.match(/db\.([^.]+)\.supabase\.co/);
if (hostMatch) {
  const projectId = hostMatch[1];
  const supabaseUrl = `https://${projectId}.supabase.co`;
  
  console.log('Project ID:', projectId);
  console.log('Supabase URL:', supabaseUrl);
  
  // Note: This would need the anon key, which we don't have
  console.log('❌ Cannot test Supabase client without anon key');
  console.log('✅ But we can confirm project ID extraction works');
} else {
  console.log('❌ Could not extract project ID from connection string');
}

console.log('\n📋 Troubleshooting Steps:');
console.log('1. Check Supabase dashboard - ensure project is "Active"');
console.log('2. Verify connection string in Supabase Settings > Database');
console.log('3. Try connecting from Supabase SQL Editor first');
console.log('4. Consider using Railway.app as alternative (postgresql-railway.md guide)');
