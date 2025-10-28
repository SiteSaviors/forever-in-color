import type { SupabaseClient } from '@supabase/supabase-js';
import { trackRuntimeMetric } from '@/utils/telemetry';

type SupabaseModule = typeof import('./supabaseClient');

type SupabaseClientInstance = SupabaseClient | null;

let supabaseClientPromise: Promise<SupabaseClientInstance> | null = null;
let clientLoadedAt: number | null = null;

const importSupabaseClient = async (): Promise<SupabaseClientInstance> => {
  const module: SupabaseModule = await import('./supabaseClient');
  const client = module.supabaseClient;
  if (client && clientLoadedAt === null) {
    clientLoadedAt = Date.now();
    trackRuntimeMetric('supabase_client_initialized', {
      at: clientLoadedAt,
    });
  }
  return client;
};

const ensureClientPromise = () => {
  if (!supabaseClientPromise) {
    supabaseClientPromise = importSupabaseClient().catch((error) => {
      supabaseClientPromise = null;
      throw error;
    });
  }
  return supabaseClientPromise;
};

export const getSupabaseClient = async (): Promise<SupabaseClientInstance> => {
  return ensureClientPromise();
};

export const prefetchSupabaseClient = (): void => {
  if (typeof window === 'undefined') {
    return;
  }
  void ensureClientPromise();
};

export const withSupabaseClient = async <T>(
  callback: (client: SupabaseClient) => Promise<T> | T,
  options: { requireClient?: boolean } = {}
): Promise<T | null> => {
  const client = await getSupabaseClient();
  if (!client) {
    if (options.requireClient ?? true) {
      throw new Error('Supabase client unavailable');
    }
    return null;
  }
  return await callback(client);
};
