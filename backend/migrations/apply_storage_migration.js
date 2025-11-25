#!/usr/bin/env node

/**
 * LifeVault Storage Migration Script
 * Applies Supabase Storage bucket creation and RLS policies
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60));
}

async function main() {
  logSection('LifeVault Storage Migration - Version 003');

  // Validate environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    log('✗ Error: Missing Supabase credentials', 'red');
    log('Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in backend/.env', 'yellow');
    process.exit(1);
  }

  log(`✓ Supabase URL: ${supabaseUrl}`, 'green');
  log(`✓ Service key configured`, 'green');

  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Step 1: Check if bucket exists
    logSection('Step 1: Checking Storage Bucket');
    
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();

    if (bucketsError) {
      log(`✗ Error listing buckets: ${bucketsError.message}`, 'red');
      throw bucketsError;
    }

    const documentsBucket = buckets.find(b => b.id === 'documents');

    if (documentsBucket) {
      log('✓ Bucket "documents" already exists', 'green');
      log(`  - Public: ${documentsBucket.public}`, 'cyan');
      log(`  - File size limit: ${documentsBucket.file_size_limit ? documentsBucket.file_size_limit / 1024 / 1024 + ' MB' : 'Not set'}`, 'cyan');
    } else {
      log('Creating bucket "documents"...', 'yellow');
      
      const { data: newBucket, error: createError } = await supabase
        .storage
        .createBucket('documents', {
          public: false,
          fileSizeLimit: 52428800, // 50 MB
        });

      if (createError) {
        log(`✗ Error creating bucket: ${createError.message}`, 'red');
        throw createError;
      }

      log('✓ Bucket "documents" created successfully', 'green');
    }

    // Step 2: Apply RLS policies
    logSection('Step 2: Applying Storage RLS Policies');

    const migrationPath = path.join(__dirname, '003_storage_buckets.sql');
    
    if (!fs.existsSync(migrationPath)) {
      log(`✗ Migration file not found: ${migrationPath}`, 'red');
      process.exit(1);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    log('✓ Migration file loaded', 'green');

    // Execute the migration SQL
    log('Executing storage RLS policies...', 'yellow');
    
    const { data, error: sqlError } = await supabase.rpc('exec_sql', {
      sql_query: migrationSQL
    });

    // Note: Supabase doesn't have a direct SQL execution method via JS client
    // You'll need to run the SQL manually in the dashboard or use the CLI
    log('⚠ Note: SQL policies must be applied via Supabase Dashboard or CLI', 'yellow');
    log('  1. Open Supabase Dashboard → SQL Editor', 'cyan');
    log('  2. Copy contents of 003_storage_buckets.sql', 'cyan');
    log('  3. Paste and execute in SQL Editor', 'cyan');

    // Step 3: Verify setup
    logSection('Step 3: Verification');

    // Check bucket again
    const { data: finalBuckets, error: finalError } = await supabase
      .storage
      .listBuckets();

    if (finalError) {
      log(`✗ Error verifying buckets: ${finalError.message}`, 'red');
      throw finalError;
    }

    const finalBucket = finalBuckets.find(b => b.id === 'documents');

    if (finalBucket) {
      log('✓ Bucket verification passed', 'green');
      log(`  - Name: ${finalBucket.name}`, 'cyan');
      log(`  - Public: ${finalBucket.public}`, 'cyan');
      log(`  - File size limit: ${finalBucket.file_size_limit ? finalBucket.file_size_limit / 1024 / 1024 + ' MB' : 'Not set'}`, 'cyan');
    } else {
      log('✗ Bucket verification failed', 'red');
    }

    // Summary
    logSection('Migration Summary');
    log('✓ Storage bucket created/verified', 'green');
    log('⚠ RLS policies need manual application (see note above)', 'yellow');
    log('✓ Next step: Apply 003_storage_buckets.sql in Supabase Dashboard', 'green');

    logSection('Next Steps');
    log('1. Open Supabase Dashboard → SQL Editor', 'cyan');
    log('2. Run: backend/migrations/003_storage_buckets.sql', 'cyan');
    log('3. Verify: backend/migrations/verify_storage_policies.sql', 'cyan');
    log('4. Test: Upload a document via backend API', 'cyan');

  } catch (error) {
    logSection('Migration Failed');
    log(`✗ Error: ${error.message}`, 'red');
    if (error.stack) {
      log(error.stack, 'red');
    }
    process.exit(1);
  }
}

// Run the migration
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
