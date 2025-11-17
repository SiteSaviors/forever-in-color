import type {
  AuthChangeEvent,
  AuthOtpResponse,
  AuthTokenResponse,
  OAuthResponse,
  Session,
  SignInWithOAuthCredentials,
  SignInWithPasswordlessCredentials,
  SignOut,
  Subscription,
} from '@supabase/auth-js';
import { GoTrueClient } from '@supabase/auth-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export type WondertoneAuthClient = {
  auth: {
    getSession: () => Promise<AuthTokenResponse>;
    setSession: (
      currentSession: Pick<Session, 'refresh_token' | 'access_token'>
    ) => Promise<AuthTokenResponse>;
    signInWithOtp: (credentials: SignInWithPasswordlessCredentials) => Promise<AuthOtpResponse>;
    signInWithOAuth: (credentials: SignInWithOAuthCredentials) => Promise<OAuthResponse>;
    signOut: (signOut?: SignOut) => Promise<{ error: Error | null }>;
    onAuthStateChange: (
      callback: (event: AuthChangeEvent, session: Session | null) => void | Promise<void>
    ) => { data: { subscription: Subscription } };
  };
  getAccessToken: () => Promise<string | null>;
  from: (table: string) => {
    select: <T = unknown>(columns: string) => {
      maybeSingle: () => Promise<{ data: T | null; error: { message: string } | null; count: number | null }>;
    };
    upsert: (payload: Record<string, unknown>, options?: { onConflict?: string }) => Promise<unknown>;
  };
};

type WondertoneAuthClientOptions = {
  client?: GoTrueClient;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  fetch?: typeof fetch;
};

const createDefaultGoTrueClient = (url: string, anonKey: string, fetchImpl?: typeof fetch) => {
  const authUrl = `${url.replace(/\/+$/, '')}/auth/v1`;
  const storage =
    typeof window !== 'undefined' && window.localStorage ? window.localStorage : undefined;

  return new GoTrueClient({
    url: authUrl,
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: typeof window !== 'undefined',
    storage,
    fetch: fetchImpl,
  });
};

const buildAuthHeaders = async (
  authClient: GoTrueClient,
  anonKey: string
): Promise<Record<string, string>> => {
  const { data } = await authClient.getSession();
  const accessToken = data.session?.access_token ?? null;
  if (!accessToken) {
    throw new Error('Access token unavailable for Supabase request');
  }
  return {
    apikey: anonKey,
    Authorization: `Bearer ${accessToken}`,
  };
};

export const createWondertoneAuthClient = (
  options: WondertoneAuthClientOptions = {}
): WondertoneAuthClient | null => {
  const url = options.supabaseUrl ?? SUPABASE_URL;
  const anonKey = options.supabaseAnonKey ?? SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.warn(
      '[WondertoneAuthClient] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Auth features will be disabled.'
    );
    return null;
  }

  const authClient =
    options.client ?? createDefaultGoTrueClient(url, anonKey, options.fetch ?? fetch);
  const restUrl = `${url.replace(/\/+$/, '')}/rest/v1`;
  const fetchImpl = options.fetch ?? fetch;

  const client: WondertoneAuthClient = {
    auth: {
      getSession: () => authClient.getSession(),
      setSession: (currentSession) => authClient.setSession(currentSession),
      signInWithOtp: (credentials) => authClient.signInWithOtp(credentials),
      signInWithOAuth: (credentials) => authClient.signInWithOAuth(credentials),
      signOut: (signOut) => authClient.signOut(signOut),
      onAuthStateChange: (callback) => authClient.onAuthStateChange(callback),
    },
    getAccessToken: async () => {
      const { data } = await authClient.getSession();
      return data.session?.access_token ?? null;
    },
    from: (table: string) => {
      const select = <T = unknown>(columns: string) => ({
        maybeSingle: async () => {
          if (!restUrl) {
            return {
              data: null as T | null,
              error: { message: 'Supabase REST URL is not configured' },
              count: null,
            };
          }

          const headers = await buildAuthHeaders(authClient, anonKey);
          headers.Accept = 'application/json';
          headers.Prefer = 'return=representation,single-object';

          const requestUrl = new URL(`${restUrl}/${table}`);
          requestUrl.searchParams.set('select', columns);
          requestUrl.searchParams.set('limit', '1');

          let response: Response;
          try {
            response = await fetchImpl(requestUrl.toString(), {
              method: 'GET',
              headers,
            });
          } catch (error) {
            return {
              data: null as T | null,
              error: { message: error instanceof Error ? error.message : 'Network error' },
              count: null,
            };
          }

          if (response.status === 200) {
            const payload = await response.json().catch(() => null);
            if (Array.isArray(payload)) {
              return {
                data: (payload[0] ?? null) as T | null,
                error: null,
                count: null,
              };
            }
            return {
              data: (payload ?? null) as T | null,
              error: null,
              count: null,
            };
          }

          if (response.status === 404 || response.status === 406 || response.status === 204) {
            return { data: null as T | null, error: null, count: null };
          }

          let errorMessage = `Supabase request failed (${response.status})`;
          const contentType = response.headers.get('content-type') ?? '';
          if (contentType.includes('application/json')) {
            const payload = await response.json().catch(() => null);
            if (payload?.message) {
              errorMessage = payload.message;
            } else if (payload?.error_description) {
              errorMessage = payload.error_description;
            } else if (payload?.error) {
              errorMessage = payload.error;
            }
          } else {
            const text = await response.text().catch(() => null);
            if (text) {
              errorMessage = text;
            }
          }

          return {
            data: null as T | null,
            error: { message: errorMessage },
            count: null,
          };
        },
      });
      const upsert = async (payload: Record<string, unknown>, options?: { onConflict?: string }) => {
        if (!restUrl) {
          throw new Error('Supabase REST URL is not configured');
        }

        const headers = await buildAuthHeaders(authClient, anonKey);
        headers.Accept = 'application/json';
        headers['Content-Type'] = 'application/json';
        headers.Prefer = 'return=representation,resolution=merge-duplicates';

        const requestUrl = new URL(`${restUrl}/${table}`);
        if (options?.onConflict) {
          requestUrl.searchParams.set('on_conflict', options.onConflict);
        }

        const response = await fetchImpl(requestUrl.toString(), {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => null);
          throw new Error(errorText || `Supabase request failed (${response.status})`);
        }

        return response.json().catch(() => null);
      };

      return { select, upsert };
    },
  };

  return client;
};

export const wondertoneAuthClient = createWondertoneAuthClient();
