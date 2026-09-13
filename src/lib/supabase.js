import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://miabtzbybuwqzlzxmfqd.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_sK3MIQdiiN5s3709tdxWEg_DfLsAb32';
export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
