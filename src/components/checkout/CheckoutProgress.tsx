import { useMemo } from 'react';
import clsx from 'clsx';
import { useCheckoutStore, CheckoutStep } from '@/store/useCheckoutStore';

const STEPS: Array<{ id: CheckoutStep; label: string; description: string }> = [
  { id: 'contact', label: 'Contact', description: 'Who should we reach?' },
  { id: 'shipping', label: 'Shipping', description: 'Where is it going?' },
  { id: 'payment', label: 'Payment', description: 'Secure checkout' },
  { id: 'review', label: 'Review', description: 'Final glance' },
];

const CheckoutProgress = () => {
  const { step } = useCheckoutStore();
  const activeIndex = useMemo(() => STEPS.findIndex((item) => item.id === step), [step]);

  return (
    <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
      {STEPS.map((item, index) => {
        const isActive = index === activeIndex;
        const isComplete = index < activeIndex;
        return (
          <div
            key={item.id}
            className={clsx(
              'flex items-center justify-between rounded-xl px-3 py-2 transition-all',
              isActive && 'border border-purple-400/40 bg-purple-500/15 text-white',
              isComplete && !isActive && 'text-emerald-200',
              !isActive && !isComplete && 'text-white/40'
            )}
          >
            <div className="flex items-center gap-3">
              <span
                className={clsx(
                  'flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold uppercase tracking-[0.2em]',
                  isComplete
                    ? 'border-emerald-500/50 bg-emerald-400/20 text-emerald-200'
                    : isActive
                      ? 'border-purple-400/50 bg-purple-400/20 text-purple-200'
                      : 'border-white/15 bg-white/5 text-white/40'
                )}
              >
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="text-[11px] text-white/40">{item.description}</p>
              </div>
            </div>
            {isComplete && (
              <span className="text-xs text-emerald-300">Done</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CheckoutProgress;
