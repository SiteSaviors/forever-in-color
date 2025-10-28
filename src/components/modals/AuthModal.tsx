import { FormEvent, useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuthModal } from '@/store/useAuthModal';
import { getSupabaseClient } from '@/utils/supabaseClient.loader';

const AuthModal = () => {
  const { open, mode, closeModal, setMode } = useAuthModal();
  const [email, setEmail] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const resetState = () => {
    setEmail('');
    setSubmitting(false);
    setStatus('idle');
    setError(null);
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
            <button
              type="button"
              onClick={() => closeModal()}
              className="absolute right-5 top-5 z-10 text-white/60 transition hover:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

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
                <form className="space-y-6" onSubmit={sendMagicLink}>
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
                </form>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AuthModal;
