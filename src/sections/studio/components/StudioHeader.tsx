import { clsx } from 'clsx';

export type CheckoutNotice = {
  variant: 'success' | 'warning';
  message: string;
};

type StudioHeaderProps = {
  currentStyleName?: string;
  showReturningBanner: boolean;
  onEditWelcome: () => void;
  onDismissWelcome: () => void;
  checkoutNotice?: CheckoutNotice | null;
  onDismissCheckoutNotice?: () => void;
};

const StudioHeader = ({
  currentStyleName,
  showReturningBanner,
  onEditWelcome,
  onDismissWelcome,
  checkoutNotice,
  onDismissCheckoutNotice,
}: StudioHeaderProps) => {
  return (
    <>
      <div className="border-b border-white/10 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-[1800px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-brand-indigo" />
              <span className="text-sm text-brand-indigo uppercase tracking-[0.3em]">Studio</span>
            </div>
          </div>
          <div className="text-white/70 text-sm">
            {currentStyleName || 'Select a style'}
          </div>
        </div>
      </div>

      {showReturningBanner && (
        <div className="max-w-[1800px] mx-auto px-6 pt-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/15 px-5 py-4 text-white shadow-[0_15px_45px_rgba(16,185,129,0.25)] backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-emerald-100">Welcome back! Your photo is ready to style.</p>
              <p className="text-xs text-emerald-200/80">
                Edit the crop or jump straight into exploring new canvases.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onEditWelcome}
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(16,185,129,0.35)] transition hover:scale-105"
              >
                Edit photo
              </button>
              <button
                type="button"
                onClick={onDismissWelcome}
                className="flex h-8 w-8 items-center justify-center rounded-full text-emerald-200/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Dismiss returning user message"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} fill="none">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {checkoutNotice?.message && (
        <div className="max-w-[1800px] mx-auto px-6 pt-4">
          <div
            className={clsx(
              'flex items-start gap-3 rounded-2xl border px-4 py-3',
              checkoutNotice.variant === 'success'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100'
                : 'border-amber-500/40 bg-amber-500/10 text-amber-100'
            )}
          >
            <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
              {checkoutNotice.variant === 'success' ? (
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.72-1.36 3.485 0l6.518 11.597c.75 1.335-.214 3.004-1.742 3.004H3.48c-1.528 0-2.492-1.669-1.742-3.004L8.257 3.1zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-.25-4.75a.75.75 0 10-1.5 0v2.5a.75.75 0 001.5 0v-2.5z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </span>
            <div className="flex-1 text-sm leading-6">{checkoutNotice.message}</div>
            {onDismissCheckoutNotice && (
              <button
                type="button"
                onClick={onDismissCheckoutNotice}
                className="text-white/60 transition hover:text-white"
                aria-label="Dismiss checkout message"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default StudioHeader;
