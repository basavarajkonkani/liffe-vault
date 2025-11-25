/**
 * Apply RLS Policies Migration Script
 * 
 * This script applies the Row Level Security policies to the Supabase database.
 * It reads the 002_rls_policies.sql file and executes it using the Supabase client.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function applyRLSMigration() {
  log('\n🔐 LifeVault RLS Migration Script', 'cyan');
  log('================================\n', 'cyan');

  // Validate environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    log('❌ Error: Missing required environment variables', 'red');
    log('Please ensure SUPABASE_URL and SUPABASE_SERVICE_KEY are set in .env file\n', 'yellow');
    process.exit(1);
  }

  log('✓ Environment variables loaded', 'green');
  log(`  Supabase URL: ${supabaseUrl}\n`, 'blue');

  // Initialize Supabase client with service role key
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  log('✓ Supabase client initialized\n', 'green');

  // Read the RLS migration file
  const migrationPath = path.join(__dirname, '002_rls_policies.sql');
  
  if (!fs.existsSync(migrationPath)) {
    log('❌ Error: Migration file not found', 'red');
    log(`  Expected path: ${migrationPath}\n`, 'yellow');
    process.exit(1);
  }

  log('✓ Migration file found', 'green');
  
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
  const sqlStatements = migrationSQL
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'));

  log(`  Found ${sqlStatements.length} SQL statements to execute\n`, 'blue');

  // Execute the migration
  log('📝 Applying RLS policies...', 'cyan');
  
  try {
    // Execute the entire migration as a single query
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: migrationSQL 
    });

    if (error) {
      // If RPC doesn't exist, try direct execution (note: this may not work for all statements)
      log('⚠️  RPC method not available, attempting direct execution...', 'yellow');
      
      // For Supabase, we need to execute via the REST API or use the management API
      // This is a limitation - recommend using Supabase Dashboard or CLI instead
      log('\n⚠️  Direct SQL execution from Node.js is limited', 'yellow');
      log('Please use one of these methods instead:', 'yellow');
      log('  1. Supabase Dashboard → SQL Editor (Recommended)', 'blue');
      log('  2. Supabase CLI: supabase db push', 'blue');
      log('  3. psql command: psql $DATABASE_URL -f 002_rls_policies.sql\n', 'blue');
      
      log('Migration file location:', 'cyan');
      log(`  ${migrationPath}\n`, 'blue');
      
      process.exit(1);
    }

    log('✓ RLS policies applied successfully\n', 'green');

  } catch (err) {
    log('❌ Error applying migration:', 'red');
    log(`  ${err.message}\n`, 'red');
    process.exit(1);
  }

  // Verify the migration
  log('🔍 Verifying RLS policies...', 'cyan');

  try {
    // Check if RLS is enabled on tables
    const { data: tables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('tablename, rowsecurity')
      .eq('schemaname', 'public')
      .in('tablename', ['users', 'assets', 'documents', 'nominees', 'linked_nominees']);

    if (tablesError) {
      log('⚠️  Could not verify RLS status', 'yellow');
      log(`  ${tablesError.message}`, 'yellow');
    } else if (tables) {
      log('✓ RLS Status:', 'green');
      tables.forEach(table => {
        const status = table.rowsecurity ? '✓ Enabled' : '✗ Disabled';
        const color = table.rowsecurity ? 'green' : 'red';
        log(`  ${table.tablename}: ${status}`, color);
      });
    }

    // Count policies
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('tablename', { count: 'exact' })
      .eq('schemaname', 'public')
      .in('tablename', ['users', 'assets', 'documents', 'nominees', 'linked_nominees']);

    if (policiesError) {
      log('\n⚠️  Could not count policies', 'yellow');
      log(`  ${policiesError.message}`, 'yellow');
    } else if (policies) {
      log(`\n✓ Total policies created: ${policies.length}`, 'green');
    }

  } catch (err) {
    log('\n⚠️  Verification failed:', 'yellow');
    log(`  ${err.message}`, 'yellow');
    log('\nPlease verify manually using verify_rls_policies.sql', 'yellow');
  }

  log('\n✅ Migration process complete!', 'green');
  log('\nNext steps:', 'cyan');
  log('  1. Run verify_rls_policies.sql in Supabase Dashboard', 'blue');
  log('  2. Test RLS policies with different user roles', 'blue');
  log('  3. Run backend tests: npm test', 'blue');
  log('  4. Proceed to Task 42: Create Supabase Storage buckets\n', 'blue');
}

// Run the migration
applyRLSMigration().catch(err => {
  log('\n❌ Unexpected error:', 'red');
  log(`  ${err.message}\n`, 'red');
  process.exit(1);
});
