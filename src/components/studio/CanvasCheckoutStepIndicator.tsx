import { useMemo } from 'react';
import { clsx } from 'clsx';
import { type CheckoutStep, useCheckoutStore } from '@/store/useCheckoutStore';

export const MODAL_CHECKOUT_STEPS: Array<{
  id: CheckoutStep;
  label: string;
  description: string;
}> = [
  { id: 'canvas', label: 'Canvas', description: 'Setup' },
  { id: 'contact', label: 'Contact', description: 'Who' },
  { id: 'shipping', label: 'Shipping', description: 'Where' },
  { id: 'payment', label: 'Payment', description: 'Secure' },
];

const CanvasCheckoutStepIndicator = () => {
  const { step, setStep } = useCheckoutStore();
  const activeIndex = useMemo(() => {
    const index = MODAL_CHECKOUT_STEPS.findIndex((item) => item.id === step);
    return index === -1 ? 0 : index;
  }, [step]);

  const progress = useMemo(() => {
    if (MODAL_CHECKOUT_STEPS.length <= 1) return 0;
    return (activeIndex / (MODAL_CHECKOUT_STEPS.length - 1)) * 100;
  }, [activeIndex]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60">
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-purple-400 via-fuchsia-400 to-emerald-300 transition-[width] duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
      <div className="flex flex-nowrap items-center gap-2 overflow-x-auto scrollbar-hide">
        {MODAL_CHECKOUT_STEPS.map((item, index) => {
          const isActive = index === activeIndex;
          const isComplete = index < activeIndex;
          const canNavigate = isComplete;

          const handleClick = () => {
            if (!canNavigate) return;
            setStep(item.id);
          };

          return (
            <button
              type="button"
              key={item.id}
              onClick={handleClick}
              disabled={!canNavigate}
              aria-current={isActive ? 'step' : undefined}
              className={clsx(
                'group flex min-w-[130px] flex-col rounded-2xl border px-3 py-2 text-left font-semibold tracking-[0.12em] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/70 disabled:cursor-default',
                isActive && 'border-purple-400/60 bg-purple-500/15 text-white shadow-[0_0_25px_rgba(139,92,246,0.45)]',
                isComplete && !isActive && 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20',
                !isActive && !isComplete && 'border-white/10 bg-transparent text-white/35'
              )}
              aria-disabled={!canNavigate}
            >
              <span className="text-[11px] uppercase leading-none">{item.label}</span>
              <span className="text-[10px] uppercase text-white/40">{item.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CanvasCheckoutStepIndicator;
