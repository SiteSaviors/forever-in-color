import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2, ShieldCheck } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuthModal } from '@/store/useAuthModal';
import { getEnabledProviders, type OAuthProviderConfig, type ProviderId } from '@/config/oauthProviders';
import { handleProviderSignIn } from '@/utils/oauthProvider';

const AUTH_GATE_COPY = {
  headline: 'Your Photo Is Ready For Styling!',
  subhead: 'Create a Free Account to Continue (10 Free Tokens A Month!)',
  cta_secondary: 'Sign Up with email',
  dividerLabel: 'OR',
  legal: 'By continuing, you agree to Terms & Privacy',
  trust_signal: 'No credit card required • Cancel anytime',
  progress_indicator: 'Photo uploaded • Sign in to generate',
} as const;

const AuthGateModal = () => {
  const { gateOpen, clearGateIntent, completeGateIntent, openModal } = useAuthModal((state) => ({
    gateOpen: state.gateOpen,
    clearGateIntent: state.clearGateIntent,
    completeGateIntent: state.completeGateIntent,
    openModal: state.openModal,
  }));

  const [loadingProvider, setLoadingProvider] = useState<ProviderId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const providers = useMemo(() => {
    const enabled = getEnabledProviders();
    if (enabled.length > 0) {
      return enabled;
    }
    // Fallback ensures at least Google button renders even if flags misconfigured.
    return [
      {
        id: 'google',
        supabaseId: 'google',
        label: 'Google',
        cta: 'Sign Up with Google',
        iconType: 'lucide',
        icon: ShieldCheck,
        buttonTheme: 'light',
        enabled: true,
      } satisfies OAuthProviderConfig,
    ];
  }, []);

  const closingProgrammaticallyRef = useRef(false);

  const finalizeClose = (reason: 'dismiss' | 'close') => {
    closingProgrammaticallyRef.current = true;
    clearGateIntent(reason);
  };

  const handleDismiss = (reason: 'dismiss' | 'close') => {
    finalizeClose(reason);
  };

  const handleDialogOpenChange = (next: boolean) => {
    if (next) return;
    if (closingProgrammaticallyRef.current) {
      closingProgrammaticallyRef.current = false;
      return;
    }
    handleDismiss('dismiss');
  };

  useEffect(() => {
    if (!gateOpen) {
      setLoadingProvider(null);
      setError(null);
    }
  }, [gateOpen]);

  const handleProviderClick = async (providerId: ProviderId) => {
    setError(null);
    setLoadingProvider(providerId);
    const result = await handleProviderSignIn(providerId);
    setLoadingProvider(null);
    if (!result.success) {
      setError(result.message);
    } else {
      closingProgrammaticallyRef.current = true;
    }
  };

  const handleEmailSignIn = () => {
    closingProgrammaticallyRef.current = true;
    completeGateIntent('email');
    openModal('signup');
  };

  return (
    <Dialog.Root open={gateOpen} onOpenChange={handleDialogOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-slate-950/85 backdrop-blur-lg" />
        <Dialog.Content className="fixed inset-0 z-[61] flex items-center justify-center px-4 py-6">
          <div className="relative w-full max-w-lg animate-fadeIn rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900/95 to-slate-950 p-8 shadow-[0_35px_120px_rgba(76,29,149,0.45)]">
            <button
              type="button"
              onClick={() => handleDismiss('close')}
              className="absolute right-6 top-6 text-white/60 transition hover:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.35em] text-white/60">
                {AUTH_GATE_COPY.progress_indicator}
              </div>

              <div className="space-y-3">
                <Dialog.Title className="font-display text-[2rem] font-semibold tracking-tight text-white">
                  {AUTH_GATE_COPY.headline}
                </Dialog.Title>
                <Dialog.Description className="text-base text-white/70">
                  {AUTH_GATE_COPY.subhead}
                </Dialog.Description>
              </div>

              <div className="space-y-3">
                {providers.map((provider) => {
                  const isLoading = loadingProvider === provider.id;
                  let iconNode: ReactNode;
                  if (provider.iconType === 'asset') {
                    iconNode = (
                      <img
                        src={provider.iconSrc}
                        alt=""
                        className="h-4 w-4 object-contain"
                        aria-hidden="true"
                      />
                    );
                  } else {
                    const ProviderIcon = provider.icon;
                    iconNode = <ProviderIcon className="h-4 w-4" aria-hidden="true" />;
                  }
                  return (
                    <button
                      key={provider.id}
                      type="button"
                      onClick={() => handleProviderClick(provider.id)}
                      disabled={isLoading}
                      className="group relative flex w-full items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/70 disabled:opacity-60"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-slate-950/60 text-white/80 shadow-[inset_0_0_12px_rgba(255,255,255,0.12)]">
                        {iconNode}
                      </span>
                      <span className="flex-1">{provider.cta}</span>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-white/80" /> : null}
                    </button>
                  );
                })}

                <div className="flex items-center gap-3 text-white/40">
                  <span className="h-px flex-1 bg-white/15" />
                  <span className="text-xs uppercase tracking-[0.35em]">{AUTH_GATE_COPY.dividerLabel}</span>
                  <span className="h-px flex-1 bg-white/15" />
                </div>

                <Button
                  onClick={handleEmailSignIn}
                  className="w-full rounded-2xl bg-gradient-to-r from-amber-300 via-amber-400 to-rose-300 text-slate-950 shadow-[0_12px_40px_rgba(255,196,0,0.35)] hover:brightness-105"
                >
                  {AUTH_GATE_COPY.cta_secondary}
                </Button>
              </div>

              {error ? (
                <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">
                  {error}
                </p>
              ) : null}

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/80">
                  <ShieldCheck className="h-5 w-5 flex-shrink-0 text-white/70" />
                  <span>{AUTH_GATE_COPY.trust_signal}</span>
                </div>
                <p className="text-center text-xs text-white/50">
                  {AUTH_GATE_COPY.legal}
                </p>
              </div>

            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AuthGateModal;
