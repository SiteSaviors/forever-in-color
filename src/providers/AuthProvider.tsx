import { useEffect, type ReactNode } from 'react';
import { supabaseClient } from '@/utils/supabaseClient';
import { useFounderStore } from '@/store/useFounderStore';
import AuthModal from '@/components/modals/AuthModal';

type AuthProviderProps = {
  children: ReactNode;
};

const AuthProvider = ({ children }: AuthProviderProps) => {
  const setSession = useFounderStore((state) => state.setSession);

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
    </>
  );
};

export default AuthProvider;
