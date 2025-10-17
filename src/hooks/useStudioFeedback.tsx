import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import UpgradePromptModal, { type UpgradePromptModalProps } from '@/components/modals/UpgradePromptModal';

type ToastVariant = 'info' | 'success' | 'warning' | 'error';

export type StudioToastPayload = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

export type UpgradePromptPayload = Omit<UpgradePromptModalProps, 'open' | 'onClose'>;

type ActiveToast = (StudioToastPayload & { id: number }) | null;

const variantClasses: Record<ToastVariant, string> = {
  info: 'border-blue-400/60 bg-blue-500/15 text-blue-100',
  success: 'border-emerald-400/60 bg-emerald-500/15 text-emerald-100',
  warning: 'border-amber-400/60 bg-amber-500/15 text-amber-100',
  error: 'border-rose-400/60 bg-rose-500/15 text-rose-100',
};

type StudioToastProps = {
  toast: ActiveToast;
  onDismiss: () => void;
};

const StudioToast = ({ toast, onDismiss }: StudioToastProps) => {
  if (!toast) return null;
  const variant = toast.variant ?? 'info';
  return (
    <div className="fixed top-6 left-1/2 z-[110] flex -translate-x-1/2">
      <div
        className={`min-w-[260px] max-w-sm rounded-2xl border px-5 py-4 shadow-xl backdrop-blur ${variantClasses[variant]}`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 space-y-1">
            <p className="text-sm font-semibold">{toast.title}</p>
            {toast.description && <p className="text-xs text-white/80 leading-relaxed">{toast.description}</p>}
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-full p-1 text-white/60 transition hover:bg-white/10 hover:text-white"
            aria-label="Dismiss notification"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} fill="none">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export const useStudioFeedback = () => {
  const [toast, setToast] = useState<ActiveToast>(null);
  const [upgradePrompt, setUpgradePrompt] = useState<UpgradePromptPayload | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
    };
  }, []);

  const dismissToast = useCallback(() => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback(
    (payload: StudioToastPayload) => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
      const id = Date.now();
      setToast({ ...payload, id });
      const duration = payload.duration ?? 4000;
      toastTimerRef.current = window.setTimeout(() => {
        setToast((current) => (current?.id === id ? null : current));
        toastTimerRef.current = null;
      }, duration);
    },
    []
  );

  const dismissUpgradeModal = useCallback(() => {
    setUpgradePrompt(null);
  }, []);

  const showUpgradeModal = useCallback((payload: UpgradePromptPayload) => {
    setUpgradePrompt(payload);
  }, []);

  const renderFeedback = useCallback(
    () => (
      <>
        <StudioToast toast={toast} onDismiss={dismissToast} />
        <UpgradePromptModal
          open={Boolean(upgradePrompt)}
          onClose={dismissUpgradeModal}
          title={upgradePrompt?.title ?? ''}
          description={upgradePrompt?.description ?? ''}
          ctaLabel={upgradePrompt?.ctaLabel}
          onCta={upgradePrompt?.onCta}
          secondaryLabel={upgradePrompt?.secondaryLabel}
          onSecondary={upgradePrompt?.onSecondary}
        />
      </>
    ),
    [toast, dismissToast, upgradePrompt, dismissUpgradeModal]
  );

  return useMemo(
    () => ({
      showToast,
      showUpgradeModal,
      dismissToast,
      dismissUpgradeModal,
      renderFeedback,
    }),
    [showToast, showUpgradeModal, dismissToast, dismissUpgradeModal, renderFeedback]
  );
};
