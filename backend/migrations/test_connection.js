/**
 * Test Supabase Connection Script
 * Run this before executing migrations to verify your Supabase credentials
 * 
 * Usage: node migrations/test_connection.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

console.log('🔍 Testing Supabase Connection...\n');

// Check if environment variables are set
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERROR: Missing Supabase credentials');
  console.error('   Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in your .env file\n');
  process.exit(1);
}

console.log('✅ Environment variables found');
console.log(`   SUPABASE_URL: ${supabaseUrl}`);
console.log(`   SUPABASE_SERVICE_KEY: ${supabaseKey.substring(0, 20)}...\n`);

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection by querying system tables
async function testConnection() {
  try {
    console.log('🔌 Attempting to connect to Supabase...');
    
    // Try to query information_schema to verify connection
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);

    if (error) {
      // This is expected if we don't have direct access to information_schema
      // Try an alternative test
      console.log('⚠️  Direct query failed, trying alternative test...');
      
      // Try to access auth admin (requires service key)
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1
      });

      if (authError) {
        throw authError;
      }

      console.log('✅ Connection successful!');
      console.log('✅ Service role key is valid');
      console.log(`   Found ${authData.users.length} user(s) in auth system\n`);
    } else {
      console.log('✅ Connection successful!');
      console.log('✅ Database access verified\n');
    }

    console.log('📋 Next Steps:');
    console.log('   1. Open Supabase Dashboard: https://app.supabase.com');
    console.log('   2. Navigate to SQL Editor');
    console.log('   3. Copy contents of migrations/001_initial_schema.sql');
    console.log('   4. Paste and run in SQL Editor');
    console.log('   5. Verify tables in Table Editor');
    console.log('   6. Run migrations/verify_schema.sql to confirm\n');

    console.log('📖 For detailed instructions, see: migrations/EXECUTION_GUIDE.md\n');

  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('   Error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Verify SUPABASE_URL is correct (should end with .supabase.co)');
    console.error('   2. Verify SUPABASE_SERVICE_KEY is the service_role key (not anon key)');
    console.error('   3. Check your internet connection');
    console.error('   4. Verify your Supabase project is active\n');
    process.exit(1);
  }
}

testConnection();
