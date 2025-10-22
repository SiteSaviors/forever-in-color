import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2, ShieldCheck } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useFounderStore } from '@/store/useFounderStore';
import { useAuthModal } from '@/store/useAuthModal';

const AUTH_GATE_COPY = {
  headline: 'Your photo is ready for AI styling!',
  subhead: 'Create a free account to continue (10 styles/month free)',
  cta_primary: 'Continue with Google',
  cta_secondary: 'Sign in with email',
  legal: 'By continuing, you agree to Terms & Privacy',
  trust_signal: 'No credit card required • Cancel anytime',
  progress_indicator: 'Photo uploaded ✓ • Cropped ✓ • Sign in to generate →',
} as const;

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

const AuthGateModal = () => {
  const open = useFounderStore((state) => state.authGateOpen);
  const setAuthGateOpen = useFounderStore((state) => state.setAuthGateOpen);
  const openAuthModal = useAuthModal((state) => state.openModal);

  const [isGoogleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setAuthGateOpen(false);
  };

  useEffect(() => {
    if (!open) {
      setGoogleLoading(false);
      setError(null);
    }
  }, [open]);

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setError(null);
      const supabase = await getSupabaseClient();
      if (!supabase) {
        throw new Error('Authentication is not configured.');
      }

      setAuthGateOpen(false);

      const redirectTo = `${window.location.origin}/create`;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      });

      if (oauthError) {
        throw oauthError;
      }

      // Supabase will redirect. Ensure pending preview is retained if the tab stays open.
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed. Please try again.';
      setError(message);
      setAuthGateOpen(true);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailSignIn = () => {
    setAuthGateOpen(false);
    openAuthModal('signup');
  };

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-0 z-[61] flex items-center justify-center px-4 py-6">
          <div className="relative w-full max-w-lg animate-fadeIn rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900/95 to-slate-950 p-8 shadow-[0_35px_120px_rgba(76,29,149,0.45)]">
            <button
              type="button"
              onClick={handleClose}
              className="absolute right-6 top-6 text-white/60 transition hover:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-6">
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
                {AUTH_GATE_COPY.progress_indicator}
              </div>

              <div className="space-y-3">
                <Dialog.Title className="text-3xl font-semibold text-white">
                  {AUTH_GATE_COPY.headline}
                </Dialog.Title>
                <Dialog.Description className="text-sm text-white/70">
                  {AUTH_GATE_COPY.subhead}
                </Dialog.Description>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                  className="flex w-full items-center justify-center gap-2 bg-white text-slate-900 hover:bg-white/90"
                >
                  {isGoogleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {AUTH_GATE_COPY.cta_primary}
                </Button>

                <Button
                  variant="ghost"
                  onClick={handleEmailSignIn}
                  className="w-full border-white/20 bg-transparent text-white hover:bg-white/10"
                >
                  {AUTH_GATE_COPY.cta_secondary}
                </Button>
              </div>

              {error ? (
                <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">
                  {error}
                </p>
              ) : null}

              <div className="flex items-center gap-3 rounded-2xl border border-purple-400/20 bg-purple-500/10 px-4 py-3 text-sm text-purple-100">
                <ShieldCheck className="h-5 w-5 flex-shrink-0" />
                <span>{AUTH_GATE_COPY.trust_signal}</span>
              </div>

              <p className="text-center text-xs text-white/50">
                {AUTH_GATE_COPY.legal}
              </p>

            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AuthGateModal;
