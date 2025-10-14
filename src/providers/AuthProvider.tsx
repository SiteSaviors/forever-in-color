import { useEffect, type ReactNode } from 'react';
import { supabaseClient } from '@/utils/supabaseClient';
import { useFounderStore } from '@/store/useFounderStore';
import AuthModal from '@/components/modals/AuthModal';
import TokenDecrementToast from '@/components/ui/TokenDecrementToast';
import QuotaExhaustedModal from '@/components/modals/QuotaExhaustedModal';

type AuthProviderProps = {
  children: ReactNode;
};

const AuthProvider = ({ children }: AuthProviderProps) => {
  const setSession = useFounderStore((state) => state.setSession);
  const showTokenToast = useFounderStore((state) => state.showTokenToast);
  const setShowTokenToast = useFounderStore((state) => state.setShowTokenToast);
  const showQuotaModal = useFounderStore((state) => state.showQuotaModal);
  const setShowQuotaModal = useFounderStore((state) => state.setShowQuotaModal);
  const entitlements = useFounderStore((state) => state.entitlements);
  const remainingTokens = entitlements.remainingTokens;

  useEffect(() => {
    if (!supabaseClient) {
      // If Supabase is not configured, ensure we reset to anonymous state.
      setSession(null, null);
      return;
    }

    let isMounted = true;

    const bootstrap = async () => {
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
    };

    void bootstrap();

    const { data: listener } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setSession(
        session?.user
          ? {
              id: session.user.id,
              email: session.user.email ?? null,
            }
          : null,
        session?.access_token ?? null
      );
    });

    return () => {
      isMounted = false;
      listener?.subscription.unsubscribe();
    };
  }, [setSession]);

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
