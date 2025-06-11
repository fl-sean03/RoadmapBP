import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Initialize the Supabase client - these should be in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Log initialization status for debugging
if (!supabaseUrl || !supabaseKey) {
  console.error('[Supabase] Missing environment variables:',
    !supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL is missing or empty' : '',
    !supabaseKey ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY is missing or empty' : ''
  );
  
  console.error('[Supabase] IMPORTANT: Make sure you have created a .env.local file with these variables');
  console.error('[Supabase] Also check that your Next.js server was restarted after adding these variables');
} else {
  console.log('[Supabase] Initializing client with URL:', supabaseUrl);
}

// Create and export the Supabase client with fallback empty strings to prevent crashes
// This will fail gracefully, rather than crashing the app if environment variables are missing
export const supabase = createClient<Database>(
  supabaseUrl || 'https://missing-url-check-env-local-file.supabase.co', 
  supabaseKey || 'missing-key-check-env-local-file'
);

// Test the connection
(async () => {
  try {
    if (!supabaseUrl || !supabaseKey) {
      console.error('[Supabase] Skipping connection test due to missing credentials');
      return;
    }
    
    console.log('[Supabase] Testing database connection...');
    const { error } = await supabase.from('roadmaps').select('id').limit(1);
    
    if (error) {
      console.error('[Supabase] Connection test failed:', error);
      console.error('[Supabase] Error code:', error.code);
      console.error('[Supabase] Error message:', error.message);
      console.error('[Supabase] Error details:', error.details);
      
      if (error.code === '42P01') {
        console.error('[Supabase] Error: Table "roadmaps" does not exist. Make sure you created the table as described in the README.');
      } else if (error.code === 'PGRST116') {
        console.error('[Supabase] Error: Invalid API key or permissions issue. Check your NEXT_PUBLIC_SUPABASE_ANON_KEY.');
      } else if (error.code === '3') {
        console.error('[Supabase] Error: Connection error. Check if your NEXT_PUBLIC_SUPABASE_URL is correct.');
      }
    } else {
      console.log('[Supabase] Connection test succeeded! Database is properly configured.');
    }
  } catch (err) {
    console.error('[Supabase] Connection test exception:', err);
  }
})(); 