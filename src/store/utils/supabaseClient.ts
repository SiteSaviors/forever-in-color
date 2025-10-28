import type { SupabaseClient } from '@supabase/supabase-js';
import {
  getSupabaseClient as loadSupabaseClient,
  prefetchSupabaseClient,
  withSupabaseClient,
} from '@/utils/supabaseClient.loader';

export type SupabaseClientInstance = SupabaseClient | null;

export const getSupabaseClient = async (): Promise<SupabaseClientInstance> => {
  return loadSupabaseClient();
};

export { prefetchSupabaseClient, withSupabaseClient };
