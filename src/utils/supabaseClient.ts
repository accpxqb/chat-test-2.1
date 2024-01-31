// src/supabaseClient.js or .ts
import { createClient } from '@supabase/supabase-js';
console.log(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

// export const supabase = createClient(
//   import.meta.env.VITE_SUPABASE_URL,
//   import.meta.env.VITE_SUPABASE_ANON_KEY
// );
export const supabase = createClient(
  'https://rrlmbkjzexyccbhieadx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybG1ia2p6ZXh5Y2NiaGllYWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDY2ODQ4NDUsImV4cCI6MjAyMjI2MDg0NX0.3T6RAssVzUKnjgzL6N8wnQt9I8d0DznRKRWb-djuTxQ'
);