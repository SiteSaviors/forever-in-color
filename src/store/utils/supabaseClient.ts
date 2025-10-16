type SupabaseClientInstance = Awaited<ReturnType<typeof importSupabaseClient>>;

let cachedSupabaseClient: SupabaseClientInstance | undefined;

const importSupabaseClient = async () => {
  const module = await import('@/utils/supabaseClient');
  return module.supabaseClient;
};

export const getSupabaseClient = async (): Promise<SupabaseClientInstance> => {
  if (typeof cachedSupabaseClient !== 'undefined') {
    return cachedSupabaseClient;
  }

  cachedSupabaseClient = await importSupabaseClient();
  return cachedSupabaseClient;
};
