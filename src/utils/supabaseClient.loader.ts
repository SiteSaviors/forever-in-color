import { trackRuntimeMetric } from '@/utils/telemetry';
import type { WondertoneAuthClient } from '@/utils/wondertoneAuthClient';

type SupabaseModule = typeof import('./wondertoneAuthClient');

type SupabaseClientInstance = WondertoneAuthClient | null;

let supabaseClientPromise: Promise<SupabaseClientInstance> | null = null;
let clientLoadedAt: number | null = null;

const importSupabaseClient = async (): Promise<SupabaseClientInstance> => {
  const module: SupabaseModule = await import('./wondertoneAuthClient');
  const client = module.wondertoneAuthClient;
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
  callback: (client: WondertoneAuthClient) => Promise<T> | T,
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
