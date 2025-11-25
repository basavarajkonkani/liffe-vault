import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Initialize Supabase client with service key for admin operations
export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Export for use in services
export default supabase;
