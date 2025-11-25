// Test setup file
// This file runs before all tests

// Set test environment variables
process.env.NODE_ENV = 'development'; // Use development to allow requests without origin
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_KEY = 'test-service-key';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.PORT = '3001';

// Increase timeout for integration tests
jest.setTimeout(10000);
