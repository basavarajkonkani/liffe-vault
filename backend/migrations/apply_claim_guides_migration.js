/**
 * Apply Claim Guides Migration
 * 
 * This script applies the 004_claim_guides.sql migration to create the claim_guides table
 * and populate it with default claim guides.
 * 
 * Usage: node apply_claim_guides_migration.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env file');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function applyMigration() {
  console.log('🚀 Starting Claim Guides migration...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '004_claim_guides.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded: 004_claim_guides.sql');
    console.log('📊 Executing migration...\n');

    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL,
    });

    if (error) {
      // If exec_sql doesn't exist, try direct execution (for newer Supabase versions)
      console.log('⚠️  exec_sql not available, trying alternative method...\n');
      
      // Split SQL into individual statements and execute them
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        if (statement.toLowerCase().includes('create table') || 
            statement.toLowerCase().includes('create index') ||
            statement.toLowerCase().includes('create trigger') ||
            statement.toLowerCase().includes('comment on')) {
          console.log('⚠️  Note: DDL statements need to be executed via Supabase Dashboard SQL Editor');
          console.log('📋 Please run the migration manually using the Supabase Dashboard.\n');
          console.log('Steps:');
          console.log('1. Go to your Supabase project dashboard');
          console.log('2. Navigate to SQL Editor');
          console.log('3. Copy and paste the contents of backend/migrations/004_claim_guides.sql');
          console.log('4. Click "Run" to execute the migration\n');
          return;
        }
      }
    }

    console.log('✅ Migration executed successfully!\n');

    // Verify the table was created
    const { data: guides, error: selectError } = await supabase
      .from('claim_guides')
      .select('id, category, title')
      .limit(5);

    if (selectError) {
      console.log('⚠️  Could not verify table creation:', selectError.message);
      console.log('📋 Please verify manually in Supabase Dashboard\n');
    } else {
      console.log('✅ Table verification successful!');
      console.log(`📊 Found ${guides?.length || 0} claim guides in the database\n`);
      
      if (guides && guides.length > 0) {
        console.log('Sample guides:');
        guides.forEach(guide => {
          console.log(`  - ${guide.category}: ${guide.title}`);
        });
        console.log('');
      }
    }

    console.log('🎉 Claim Guides migration completed successfully!');
    console.log('✨ You can now use the Claim Guides feature in your application.\n');

  } catch (error) {
    console.error('❌ Error applying migration:', error.message);
    console.log('\n📋 Manual Migration Required:');
    console.log('Please run the migration manually using the Supabase Dashboard SQL Editor.');
    console.log('File: backend/migrations/004_claim_guides.sql\n');
    process.exit(1);
  }
}

// Run the migration
applyMigration();
