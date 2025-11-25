import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

// Define the schema for environment variables
const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_SERVICE_KEY: z.string().min(1, 'SUPABASE_SERVICE_KEY is required'),
  FRONTEND_URL: z.string().url('FRONTEND_URL must be a valid URL'),
});

// Validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse({
      PORT: process.env.PORT,
      NODE_ENV: process.env.NODE_ENV,
      JWT_SECRET: process.env.JWT_SECRET,
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
      FRONTEND_URL: process.env.FRONTEND_URL,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment variable validation failed:');
      error.issues.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
};

// Export validated environment variables
export const env = parseEnv();
