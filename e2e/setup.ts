/**
 * Test Setup Script
 * 
 * This script can be used to set up test data before running E2E tests.
 * It creates test users with different roles in the database.
 */

import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:3000';

interface TestUser {
  email: string;
  pin: string;
  role: 'owner' | 'nominee' | 'admin';
}

const TEST_USERS: TestUser[] = [
  {
    email: 'owner@test.com',
    pin: '123456',
    role: 'owner',
  },
  {
    email: 'nominee@test.com',
    pin: '654321',
    role: 'nominee',
  },
  {
    email: 'admin@test.com',
    pin: '111111',
    role: 'admin',
  },
];

/**
 * Create a test user
 */
async function createTestUser(user: TestUser): Promise<void> {
  try {
    console.log(`Creating test user: ${user.email}`);

    // Step 1: Send OTP
    const otpResponse = await axios.post(`${API_URL}/auth/send-otp`, {
      email: user.email,
    });

    console.log(`✓ OTP sent to ${user.email}`);

    // Note: In a real test environment, you would need to:
    // 1. Retrieve the OTP from email or Supabase
    // 2. Verify the OTP
    // 3. Set the PIN
    // 4. Complete registration

    // For now, this is a placeholder that demonstrates the flow
    console.log(`⚠ Manual step required: Verify OTP and complete registration for ${user.email}`);

  } catch (error: any) {
    if (error.response?.status === 400 && error.response?.data?.error?.includes('already')) {
      console.log(`✓ User ${user.email} already exists`);
    } else {
      console.error(`✗ Failed to create user ${user.email}:`, error.message);
    }
  }
}

/**
 * Setup all test users
 */
async function setupTestData(): Promise<void> {
  console.log('Setting up test data...\n');

  for (const user of TEST_USERS) {
    await createTestUser(user);
    console.log('');
  }

  console.log('Test data setup complete!');
  console.log('\nTest Users:');
  TEST_USERS.forEach(user => {
    console.log(`  - ${user.email} (${user.role}) - PIN: ${user.pin}`);
  });
}

/**
 * Clean up test data
 */
async function cleanupTestData(): Promise<void> {
  console.log('Cleaning up test data...\n');

  // Note: This would require admin API endpoints to delete users
  // For now, this is a placeholder

  console.log('⚠ Manual cleanup required: Delete test users from Supabase dashboard');
  console.log('Test users to delete:');
  TEST_USERS.forEach(user => {
    console.log(`  - ${user.email}`);
  });
}

// Run setup if called directly
if (require.main === module) {
  const command = process.argv[2];

  if (command === 'setup') {
    setupTestData().catch(console.error);
  } else if (command === 'cleanup') {
    cleanupTestData().catch(console.error);
  } else {
    console.log('Usage:');
    console.log('  npm run test:setup    - Create test users');
    console.log('  npm run test:cleanup  - Remove test users');
  }
}

export { setupTestData, cleanupTestData, TEST_USERS };
