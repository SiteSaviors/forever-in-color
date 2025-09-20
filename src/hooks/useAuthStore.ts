
import { useState, useEffect, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { logSessionTimeout } from "@/utils/securityLogger";

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
  const [sessionStartTime] = useState(Date.now());

  const checkSessionExpiry = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.expires_at) {
      const expiryTime = new Date(session.expires_at * 1000);
      const currentTime = new Date();
      const timeUntilExpiry = expiryTime.getTime() - currentTime.getTime();

      // Show warning if session expires within 5 minutes
      if (timeUntilExpiry <= SESSION_TIMEOUT_WARNING && timeUntilExpiry > 0) {
        setSessionTimeoutWarning(true);
      } else {
        setSessionTimeoutWarning(false);
      }

      // Auto-refresh token if it expires within 2 minutes
      if (timeUntilExpiry <= 2 * 60 * 1000 && timeUntilExpiry > 0) {
        try {
          const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();
          if (!error && refreshedSession) {
            setAuthState(prev => ({
              ...prev,
              session: refreshedSession,
              user: refreshedSession.user
            }));
          }
        } catch (error) {
          // Session refresh failed silently
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

          // Log session timeout when user signs out due to expiry
          if (event === 'SIGNED_OUT' && session?.user) {
            const sessionDuration = Date.now() - sessionStartTime;
            logSessionTimeout(session.user.id, sessionDuration);
            setSessionTimeoutWarning(false);
          }
        }
      }
    );

    // Check for existing session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
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
  }, [checkSessionExpiry, sessionStartTime]);

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
      
      // Log session duration before signing out
      if (authState.user) {
        const sessionDuration = Date.now() - sessionStartTime;
        logSessionTimeout(authState.user.id, sessionDuration);
      }
      
      await supabase.auth.signOut();
    } catch (error) {
      // Sign out failed silently
    }
  };

  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) {
        return false;
      }
      setSessionTimeoutWarning(false);
      return true;
    } catch (error) {
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
