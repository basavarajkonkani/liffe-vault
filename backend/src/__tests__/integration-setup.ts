// Integration test setup file
// This file runs before integration tests and uses real Supabase connection

import dotenv from 'dotenv';

// Load actual environment variables from .env file
dotenv.config();

// Verify required environment variables are set
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables for integration tests');
  console.error('Please ensure SUPABASE_URL and SUPABASE_SERVICE_KEY are set in .env file');
  process.exit(1);
}

// Set NODE_ENV to development to allow CORS for testing
process.env.NODE_ENV = 'development';

// Increase timeout for integration tests (Supabase operations can take time)
jest.setTimeout(30000);

console.log('🧪 Integration test setup complete');
console.log(`📡 Supabase URL: ${process.env.SUPABASE_URL}`);
