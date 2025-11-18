import { type ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { CanvasModalCloseReason } from '@/store/founder/storeTypes';

type ExitPromptConfig = {
  open: boolean;
  onStay: () => void;
  onLeave: () => void;
};

type CanvasCheckoutShellProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestClose: (reason: CanvasModalCloseReason) => void;
  exitPrompt: ExitPromptConfig;
  children: ReactNode;
};

const CanvasCheckoutShell = ({
  open,
  onOpenChange,
  onRequestClose,
  exitPrompt,
  children,
}: CanvasCheckoutShellProps) => (
  <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Overlay
        className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md"
        onPointerDown={(event) => {
          event.preventDefault();
          onRequestClose('backdrop');
        }}
      />
      <Dialog.Content
        onEscapeKeyDown={(event) => {
          event.preventDefault();
          onRequestClose('esc_key');
        }}
        onPointerDownOutside={(event) => {
          event.preventDefault();
          onRequestClose('backdrop');
        }}
        className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-10"
      >
        {children}
      </Dialog.Content>
    </Dialog.Portal>
    {exitPrompt.open && (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 px-4 py-6">
        <div className="w-full max-w-sm translate-y-2 scale-95 rounded-3xl border border-white/10 bg-slate-900/95 p-6 text-white shadow-xl opacity-0 animate-[fadeUp_200ms_ease-out_forwards]">
          <p className="text-lg font-semibold">Step away from checkout?</p>
          <p className="mt-2 text-sm text-white/70">
            Your progress will be saved for a little while. Come back any time to finish where you left off.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/70"
              onClick={exitPrompt.onStay}
            >
              Stay in checkout
            </button>
            <button
              type="button"
              className="rounded-2xl bg-white/90 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              onClick={exitPrompt.onLeave}
            >
              Leave for now
            </button>
          </div>
        </div>
      </div>
    )}
  </Dialog.Root>
);

export default CanvasCheckoutShell;
