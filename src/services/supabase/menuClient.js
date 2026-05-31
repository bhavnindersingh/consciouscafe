import { createClient } from '@supabase/supabase-js';

const url = process.env.REACT_APP_MENU_SUPABASE_URL;
const key = process.env.REACT_APP_MENU_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error(
    'Missing menu Supabase env vars:\n' +
    '- REACT_APP_MENU_SUPABASE_URL\n' +
    '- REACT_APP_MENU_SUPABASE_ANON_KEY'
  );
}

export const menuSupabase = createClient(
  url || 'https://placeholder.supabase.co',
  key || 'placeholder-key'
);
