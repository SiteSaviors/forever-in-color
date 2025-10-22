import { useEffect, type ReactNode } from 'react';
import { useFounderStore } from '@/store/useFounderStore';
import AuthModal from '@/components/modals/AuthModal';
import TokenDecrementToast from '@/components/ui/TokenDecrementToast';
import QuotaExhaustedModal from '@/components/modals/QuotaExhaustedModal';

let cachedSupabaseClient: Awaited<ReturnType<typeof importSupabaseClient>> | undefined;

async function importSupabaseClient() {
  const module = await import('@/utils/supabaseClient');
  return module.supabaseClient;
}

const getSupabaseClient = async () => {
  if (typeof cachedSupabaseClient !== 'undefined') {
    return cachedSupabaseClient;
  }
  cachedSupabaseClient = await importSupabaseClient();
  return cachedSupabaseClient;
};

type AuthProviderProps = {
  children: ReactNode;
};

const AuthProvider = ({ children }: AuthProviderProps) => {
  const setSession = useFounderStore((state) => state.setSession);
  const showTokenToast = useFounderStore((state) => state.showTokenToast);
  const setShowTokenToast = useFounderStore((state) => state.setShowTokenToast);
  const showQuotaModal = useFounderStore((state) => state.showQuotaModal);
  const setShowQuotaModal = useFounderStore((state) => state.setShowQuotaModal);
  const hydrateEntitlements = useFounderStore((state) => state.hydrateEntitlements);
  const entitlements = useFounderStore((state) => state.entitlements);
  const displayRemainingTokens = useFounderStore((state) => state.getDisplayableRemainingTokens());

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | undefined;

    const bootstrap = async () => {
      const supabaseClient = await getSupabaseClient();
      if (!supabaseClient) {
        if (isMounted) {
          setSession(null, null);
        }
        return;
      }

      // Process magic link callback tokens from URL hash
      if (typeof window !== 'undefined' && window.location.hash) {
        const hash = window.location.hash;
        console.log('[AuthProvider] URL hash detected:', hash.substring(0, 100) + '...');

        if (hash.includes('access_token')) {
          console.log('[AuthProvider] Magic link callback detected - processing tokens');
          try {
            // Extract tokens from URL hash
            const hashParams = new URLSearchParams(hash.substring(1));
            const accessToken = hashParams.get('access_token');
            const refreshToken = hashParams.get('refresh_token');

            console.log('[AuthProvider] Token extraction:', {
              hasAccessToken: !!accessToken,
              hasRefreshToken: !!refreshToken,
              accessTokenPreview: accessToken ? accessToken.substring(0, 20) + '...' : null,
            });

            if (accessToken && refreshToken) {
              // Establish session from magic link tokens
              console.log('[AuthProvider] Calling setSession with extracted tokens...');
              const { data: sessionData, error } = await supabaseClient.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

              if (error) {
                console.error('[AuthProvider] Failed to set session from magic link:', error);
              } else {
                console.log('[AuthProvider] Session established successfully:', {
                  userId: sessionData.session?.user?.id,
                  email: sessionData.session?.user?.email,
                });
              }

              // Clean URL to remove tokens from browser history
              window.history.replaceState(null, '', window.location.pathname + window.location.search);
            } else {
              console.warn('[AuthProvider] Missing tokens in URL hash - cannot establish session');
            }
          } catch (error) {
            console.error('[AuthProvider] Error processing magic link callback:', error);
          }
        } else {
          console.log('[AuthProvider] Hash present but no access_token found');
        }
      } else {
        console.log('[AuthProvider] No URL hash detected - checking for existing session');
      }

      const { data } = await supabaseClient.auth.getSession();
      if (!isMounted) return;
      const session = data.session;

      console.log('[AuthProvider] getSession result:', {
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
        hasAccessToken: !!session?.access_token,
      });

      setSession(
        session?.user
          ? {
              id: session.user.id,
              email: session.user.email ?? null,
            }
          : null,
        session?.access_token ?? null
      );

      const { data: listener } = supabaseClient.auth.onAuthStateChange((_event, nextSession) => {
        setSession(
          nextSession?.user
            ? {
                id: nextSession.user.id,
                email: nextSession.user.email ?? null,
              }
            : null,
          nextSession?.access_token ?? null
        );
      });

      unsubscribe = () => listener?.subscription.unsubscribe();
    };

    void bootstrap();

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, [setSession]);

  useEffect(() => {
    const handleFocus = () => {
      void hydrateEntitlements();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleFocus, { passive: true });
      // Refresh once on mount in case the page was backgrounded before hydration
      void hydrateEntitlements();
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', handleFocus);
      }
    };
  }, [hydrateEntitlements]);

  return (
    <>
      {children}
      <AuthModal />
      <TokenDecrementToast
        visible={showTokenToast}
        remaining={displayRemainingTokens}
        onClose={() => setShowTokenToast(false)}
      />
      <QuotaExhaustedModal
        open={showQuotaModal}
        onClose={() => setShowQuotaModal(false)}
        currentTier={entitlements.tier}
        remainingTokens={displayRemainingTokens ?? entitlements.remainingTokens}
        quota={entitlements.quota}
        renewAt={entitlements.renewAt}
      />
    </>
  );
};

export default AuthProvider;
