
import { useState, useEffect, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}

const SESSION_TIMEOUT_WARNING = 5 * 60 * 1000; // 5 minutes before expiry
const SESSION_CHECK_INTERVAL = 60 * 1000; // Check every minute

export const useAuthStore = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true
  });

  const [sessionTimeoutWarning, setSessionTimeoutWarning] = useState(false);

  const checkSessionExpiry = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.expires_at) {
      const expiryTime = new Date(session.expires_at * 1000);
      const currentTime = new Date();
      const timeUntilExpiry = expiryTime.getTime() - currentTime.getTime();

      // Show warning if session expires within 5 minutes
      if (timeUntilExpiry <= SESSION_TIMEOUT_WARNING && timeUntilExpiry > 0) {
        setSessionTimeoutWarning(true);
        console.log('Session will expire soon. Consider refreshing.');
      } else {
        setSessionTimeoutWarning(false);
      }

      // Auto-refresh token if it expires within 2 minutes
      if (timeUntilExpiry <= 2 * 60 * 1000 && timeUntilExpiry > 0) {
        try {
          const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();
          if (error) {
            console.error('Failed to refresh session:', error);
          } else if (refreshedSession) {
            console.log('Session refreshed successfully');
            setAuthState(prev => ({
              ...prev,
              session: refreshedSession,
              user: refreshedSession.user
            }));
          }
        } catch (error) {
          console.error('Error refreshing session:', error);
        }
      }
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let sessionCheckInterval: NodeJS.Timeout;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        if (mounted) {
          setAuthState({
            session,
            user: session?.user ?? null,
            isLoading: false
          });

          // Clear timeout warning when session changes
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            setSessionTimeoutWarning(false);
          }

          // Clear warning if user signs out
          if (event === 'SIGNED_OUT') {
            setSessionTimeoutWarning(false);
          }
        }
      }
    );

    // Check for existing session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        }
        if (mounted) {
          setAuthState({
            session,
            user: session?.user ?? null,
            isLoading: false
          });

          // Start session monitoring if user is authenticated
          if (session) {
            sessionCheckInterval = setInterval(checkSessionExpiry, SESSION_CHECK_INTERVAL);
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
        if (mounted) {
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      }
    };

    getSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
      }
    };
  }, [checkSessionExpiry]);

  // Start/stop session monitoring based on auth state
  useEffect(() => {
    let sessionCheckInterval: NodeJS.Timeout;

    if (authState.session) {
      sessionCheckInterval = setInterval(checkSessionExpiry, SESSION_CHECK_INTERVAL);
    }

    return () => {
      if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
      }
    };
  }, [authState.session, checkSessionExpiry]);

  const signOut = async () => {
    try {
      setSessionTimeoutWarning(false);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Failed to refresh session:', error);
        return false;
      }
      setSessionTimeoutWarning(false);
      return true;
    } catch (error) {
      console.error('Error refreshing session:', error);
      return false;
    }
  };

  return {
    ...authState,
    sessionTimeoutWarning,
    signOut,
    refreshSession
  };
};
