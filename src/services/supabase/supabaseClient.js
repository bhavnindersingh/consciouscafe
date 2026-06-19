import { createClient } from '@supabase/supabase-js';

// Single Supabase project for auth, dashboard and the delivery menu.
// The anon key is a PUBLIC client key (role: anon) — it ships in the JS
// bundle by design; Row-Level Security protects the data. We hardcode the
// real project as the default so the app works even when env vars aren't
// loaded (e.g. a dev server started before .env.local existed). Env vars,
// when present, still override these.
const SUPABASE_URL = 'https://hxpbrlqclyujirspuuav.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4cGJybHFjbHl1amlyc3B1dWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNDEzMTMsImV4cCI6MjA3NDYxNzMxM30.-0RMrh1IJLTztyfe-O0lYclVekcCYQA30cu53ZNTbZg';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
