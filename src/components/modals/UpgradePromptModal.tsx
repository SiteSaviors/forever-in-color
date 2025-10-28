import Modal from '@/components/ui/Modal';

export type UpgradePromptModalProps = {
  open: boolean;
  title: string;
  description: string;
  ctaLabel?: string;
  onCta?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  onClose: () => void;
};

const UpgradePromptModal = ({
  open,
  title,
  description,
  ctaLabel = 'View Plans',
  onCta,
  secondaryLabel,
  onSecondary,
  onClose,
}: UpgradePromptModalProps) => {
  return (
    <Modal
      open={open}
      onOpenChange={(value) => !value && onClose()}
      size="lg"
      showCloseButton={false}
      contentClassName="bg-slate-900/95 shadow-[0_40px_120px_rgba(91,33,182,0.35)]"
    >
      <div className="absolute -inset-40 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-blue-500/10 blur-3xl" />
      <div className="relative flex flex-col gap-6 p-10">
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold text-white">{title}</h2>
            <p className="text-sm text-white/70 leading-relaxed">
              {description}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
            aria-label="Close upgrade prompt"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} fill="none">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-purple-400/20 bg-purple-500/10 p-5 text-sm text-white/80">
          <p>
            Wondertone Signature tones include premium brushwork, priority rendering, and watermark-free exports.
          </p>
          <p>Upgrade now to unlock the full studio experience.</p>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {secondaryLabel && (
            <button
              type="button"
              onClick={() => {
                onSecondary?.();
                onClose();
              }}
              className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
            >
              {secondaryLabel}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              onCta?.();
              onClose();
            }}
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_15px_40px_rgba(59,130,246,0.35)] transition hover:shadow-[0_20px_50px_rgba(59,130,246,0.45)]"
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default UpgradePromptModal;
