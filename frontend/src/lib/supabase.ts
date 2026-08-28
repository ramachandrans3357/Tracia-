import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tqlxzqpaqeotrjituzxn.supabase.co';
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_lisYMIYrG-NH5sFL_kwwQg_Kh-qZz8G';

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
