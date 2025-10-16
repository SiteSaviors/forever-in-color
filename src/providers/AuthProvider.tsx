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
  const reconcileEntitlements = useFounderStore((state) => state.reconcileEntitlements);
  const entitlements = useFounderStore((state) => state.entitlements);
  const remainingTokens = entitlements.remainingTokens;

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

      const { data } = await supabaseClient.auth.getSession();
      if (!isMounted) return;
      const session = data.session;
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
      void reconcileEntitlements();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleFocus, { passive: true });
      // Reconcile once on mount in case the page was backgrounded before hydration
      void reconcileEntitlements();
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', handleFocus);
      }
    };
  }, [reconcileEntitlements]);

  return (
    <>
      {children}
      <AuthModal />
      <TokenDecrementToast
        visible={showTokenToast}
        remaining={remainingTokens}
        onClose={() => setShowTokenToast(false)}
      />
      <QuotaExhaustedModal
        open={showQuotaModal}
        onClose={() => setShowQuotaModal(false)}
        currentTier={entitlements.tier}
        remainingTokens={entitlements.remainingTokens}
        quota={entitlements.quota}
        renewAt={entitlements.renewAt}
      />
    </>
  );
};

export default AuthProvider;
