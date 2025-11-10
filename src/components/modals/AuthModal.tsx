import { FormEvent, useEffect, useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Loader2, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuthModal } from '@/store/useAuthModal';
import { getSupabaseClient } from '@/utils/supabaseClient.loader';
import { getEnabledProviders, type ProviderId } from '@/config/oauthProviders';
import { handleProviderSignIn } from '@/utils/oauthProvider';

const renderProviderCta = (mode: 'signin' | 'signup', providerLabel: string) => {
  return mode === 'signup' ? `Sign Up with ${providerLabel}` : `Sign In with ${providerLabel}`;
};

const AuthModal = () => {
  const open = useAuthModal((state) => state.open);
  const mode = useAuthModal((state) => state.mode);
  const closeModal = useAuthModal((state) => state.closeModal);
  const setMode = useAuthModal((state) => state.setMode);
  const pendingStyleId = useAuthModal((state) => state.pendingStyleId);
  const [email, setEmail] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [loadingProvider, setLoadingProvider] = useState<ProviderId | null>(null);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const providers = useMemo(() => getEnabledProviders(), []);

  const resetState = () => {
    setEmail('');
    setSubmitting(false);
    setStatus('idle');
    setError(null);
    setLoadingProvider(null);
    setOauthError(null);
  };

  useEffect(() => {
    if (!open) {
      resetState();
    }
  }, [open]);

  const sendMagicLink = async (event: FormEvent) => {
    event.preventDefault();
    if (!email) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setSubmitting(true);
      setStatus('idle');
      setError(null);

      const supabaseClient = await getSupabaseClient();
      if (!supabaseClient) {
        throw new Error('Authentication is not configured.');
      }

      const redirectTo = window.location.origin + '/create';

      const response = await supabaseClient.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (response.error) {
        throw response.error;
      }

      setStatus('success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(message);
      setStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProviderClick = async (providerId: ProviderId) => {
    setOauthError(null);
    setError(null);
    setStatus('idle');
    setLoadingProvider(providerId);
    const result = await handleProviderSignIn(providerId, {
      completeGateIntent: Boolean(pendingStyleId),
    });
    setLoadingProvider(null);
    if (!result.success) {
      setOauthError(result.message);
      setStatus('error');
      return;
    }
    closeModal();
  };

  const title = mode === 'signin' ? 'Welcome Back' : 'Create Your Wondertone Account';
  const description =
    mode === 'signin'
      ? 'Sign in with a magic link – no password required.'
      : 'Create an account to unlock more generations and save your masterpieces.';

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && closeModal()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl" />
        <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center px-6 py-12">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 shadow-[0_35px_120px_rgba(76,29,149,0.45)]">
            <div className="pointer-events-none absolute inset-0 rounded-3xl border border-transparent bg-gradient-to-br from-purple-500/20 via-indigo-500/20 to-blue-500/20" />
            <Dialog.Close asChild>
              <button
                type="button"
                onClick={() => closeModal()}
                className="absolute right-5 top-5 z-20 cursor-pointer rounded-full p-1 text-white/60 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/70"
                aria-label="Close authentication modal"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>

            <div className="relative z-10 space-y-8 px-8 py-10">
              <div className="space-y-2 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">Wondertone Studio</p>
                <Dialog.Title className="text-3xl font-semibold text-white">{title}</Dialog.Title>
                <Dialog.Description className="text-sm text-white/60">
                  {description}
                </Dialog.Description>
              </div>

              {status === 'success' ? (
                <div className="space-y-6 text-center text-white/80">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/20 via-emerald-500/20 to-teal-500/20 border border-emerald-400/40 shadow-[0_10px_40px_rgba(16,185,129,0.35)]">
                    <svg className="h-6 w-6 text-emerald-300" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-white">Magic link sent!</p>
                    <p className="text-sm text-white/60">
                      Check <span className="text-white">{email}</span> for a one-time sign-in link. You can close this window once you’re in.
                    </p>
                  </div>
                  <Button className="w-full" onClick={() => closeModal()}>
                    Back to creating
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {providers.length > 0 ? (
                    <div className="space-y-3">
                      {providers.map((provider) => {
                        const isLoading = loadingProvider === provider.id;
                        const ctaLabel = renderProviderCta(mode, provider.label);
                        return (
                          <button
                            key={provider.id}
                            type="button"
                            onClick={() => handleProviderClick(provider.id)}
                            disabled={isLoading}
                            aria-label={ctaLabel}
                            className="group relative flex w-full min-h-[52px] items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/70 disabled:opacity-60"
                          >
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-slate-950/60 text-white/80 shadow-[inset_0_0_12px_rgba(255,255,255,0.12)]">
                              {provider.iconType === 'asset' ? (
                                <img
                                  src={provider.iconSrc}
                                  alt=""
                                  className="h-4 w-4 object-contain"
                                  aria-hidden="true"
                                />
                              ) : (
                                <provider.icon className="h-4 w-4" aria-hidden="true" />
                              )}
                            </span>
                            <span className="flex-1 text-white">{ctaLabel}</span>
                            {isLoading ? (
                              <Loader2 className="ml-auto h-4 w-4 animate-spin text-white/80" aria-hidden="true" />
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                  {oauthError ? (
                    <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                      {oauthError}
                    </p>
                  ) : null}

                  {providers.length > 0 ? (
                    <div className="flex items-center gap-3 text-white/40">
                      <span className="h-px flex-1 bg-white/15" />
                      <span className="text-xs uppercase tracking-[0.35em]">OR</span>
                      <span className="h-px flex-1 bg-white/15" />
                    </div>
                  ) : null}

                  <form className="space-y-5" onSubmit={sendMagicLink}>
                    <label className="block text-left text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                      Email
                      <div className="mt-2 rounded-2xl border border-white/10 bg-white/5">
                        <input
                          type="email"
                          required
                          autoComplete="email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          className="w-full rounded-2xl border-none bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400/60"
                          placeholder="you@example.com"
                        />
                      </div>
                    </label>

                    {error && (
                      <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                        {error}
                      </p>
                    )}

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? 'Sending magic link…' : 'Send magic link'}
                    </Button>
                  </form>

                  <div className="text-center text-xs text-white/50">
                    {mode === 'signin' ? (
                      <button
                        type="button"
                        className="font-semibold text-white/70 hover:text-white"
                        onClick={() => {
                          setMode('signup');
                          setError(null);
                        }}
                      >
                        New to Wondertone? Create an account
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="font-semibold text-white/70 hover:text-white"
                        onClick={() => {
                          setMode('signin');
                          setError(null);
                        }}
                      >
                        Already have an account? Sign in
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AuthModal;
