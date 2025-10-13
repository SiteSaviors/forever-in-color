import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useFounderStore } from '@/store/useFounderStore';
import { useMemo } from 'react';

interface AccountPromptModalProps {
  open: boolean;
  onClose: () => void;
}

const AccountPromptModal = ({ open, onClose }: AccountPromptModalProps) => {
  const dismissAccountPrompt = useFounderStore((state) => state.dismissAccountPrompt);
  const setAuthenticated = useFounderStore((state) => state.setAuthenticated);
  const previews = useFounderStore((state) => state.previews);
  const styles = useFounderStore((state) => state.styles);

  // Get the first 3 completed previews to show thumbnails
  const completedPreviews = useMemo(() => {
    const completed: Array<{ id: string; name: string; url: string }> = [];

    for (const style of styles) {
      const preview = previews[style.id];
      if (preview?.status === 'ready' && preview.data) {
        completed.push({
          id: style.id,
          name: style.name,
          url: preview.data.previewUrl || style.preview,
        });

        if (completed.length === 3) break;
      }
    }

    return completed;
  }, [previews, styles]);

  const handleCreateAccount = () => {
    // Mock account creation - in production, this would open signup flow
    setAuthenticated(true);
    onClose();

    // TODO: Implement actual signup flow with Supabase
    // For now, just set authenticated state
  };

  const handleDismiss = () => {
    dismissAccountPrompt();
    onClose();
  };

  return (
    <Dialog.Root open={open} onOpenChange={(value) => !value && handleDismiss()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-purple-900/30 border-2 border-purple-400/30 rounded-3xl shadow-[0_0_60px_rgba(168,85,247,0.3)] w-full max-w-md p-8 space-y-6 relative">
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-6 right-6 text-white/60 hover:text-white transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Preview thumbnails */}
            {completedPreviews.length > 0 && (
              <div className="flex gap-3 justify-center">
                {completedPreviews.map((preview) => (
                  <div
                    key={preview.id}
                    className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-white/20"
                  >
                    <img
                      src={preview.url}
                      alt={preview.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Heading */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Love What You're Creating?
              </h2>
              <p className="text-base text-white/70">
                Create a free account to save your artwork and unlock 5 more generations
              </p>
            </div>

            {/* Benefits list */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-white">Personal art library</p>
                  <p className="text-xs text-white/60">Unlimited storage for all your creations</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-white">Access from any device</p>
                  <p className="text-xs text-white/60">Pick up where you left off</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-white">5 more free generations today</p>
                  <p className="text-xs text-white/60">8 total generations with a free account</p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <Button
              onClick={handleCreateAccount}
              className="w-full bg-gradient-cta text-white py-4 text-base font-bold shadow-glow-purple hover:shadow-[0_0_80px_rgba(168,85,247,0.5)] transition-all"
            >
              Create Free Account
            </Button>

            {/* Dismiss link */}
            <button
              onClick={handleDismiss}
              className="w-full text-center text-sm text-white/60 hover:text-white transition"
            >
              Maybe Later
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AccountPromptModal;
