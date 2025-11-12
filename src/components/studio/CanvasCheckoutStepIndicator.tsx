import { memo, useEffect, useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { shallow } from 'zustand/shallow';
import { type CheckoutStep, useCheckoutStore } from '@/store/useCheckoutStore';

export const MODAL_CHECKOUT_STEPS: Array<{
  id: CheckoutStep;
  label: string;
  description: string;
}> = [
  { id: 'canvas', label: 'Your Masterpiece', description: 'Setup' },
  { id: 'contact', label: 'Contact Info', description: 'Who' },
  { id: 'shipping', label: 'Shipping Address', description: 'Where' },
  { id: 'payment', label: 'Make It Official', description: 'Secure' },
];

interface CanvasCheckoutStepIndicatorProps {
  showTimer?: boolean;
  timerSeed?: number | null;
  timerRunning?: boolean;
}

const CanvasCheckoutStepIndicatorComponent: React.FC<CanvasCheckoutStepIndicatorProps> = ({
  showTimer = false,
  timerSeed,
  timerRunning = false,
}) => {
  const { step, setStep } = useCheckoutStore(
    (state) => ({
      step: state.step,
      setStep: state.setStep,
    }),
    shallow
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const activeIndex = useMemo(() => {
    const index = MODAL_CHECKOUT_STEPS.findIndex((item) => item.id === step);
    return index === -1 ? 0 : index;
  }, [step]);

  const progress = useMemo(() => {
    if (MODAL_CHECKOUT_STEPS.length <= 1) return 0;
    return (activeIndex / (MODAL_CHECKOUT_STEPS.length - 1)) * 100;
  }, [activeIndex]);

  useEffect(() => {
    if (!showTimer || !timerSeed) {
      setElapsedSeconds(0);
      return;
    }

    const updateElapsed = () => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - timerSeed) / 1000)));
    };

    updateElapsed();

    if (!timerRunning) {
      return;
    }

    const intervalId = window.setInterval(updateElapsed, 1000);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [showTimer, timerSeed, timerRunning]);

  const timeMessage = useMemo(() => {
    if (!showTimer) return null;
    if (elapsedSeconds < 120) return '~2 min remaining';
    if (elapsedSeconds < 180) return '~1 min remaining';
    return 'Take your time—no rush';
  }, [showTimer, elapsedSeconds]);

  return (
    <div className="space-y-2">
      {/* Progress Header (Desktop Only) */}
      <div className="hidden lg:flex items-center justify-between text-sm text-white/60 px-1 font-medium">
        <span>4 steps to your masterpiece</span>
        <span className="text-white/50">Looking great so far</span>
      </div>

      {/* Step Indicator - Unified Pill Design */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 px-6 py-4">
        {/* Progress Bar with Spring Easing */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-purple-400 via-fuchsia-400 to-emerald-300 transition-[width] duration-700"
          style={{
            width: `${progress}%`,
            transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />

        {/* Traveling Glow */}
        <div
          className="pointer-events-none absolute bottom-0 h-[2px] w-12 blur-sm bg-gradient-to-r from-transparent via-purple-300 to-transparent opacity-80 transition-[left] duration-700"
          style={{
            left: `calc(${progress}% - 24px)`,
            transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />

        {/* Steps Grid */}
        <div className="grid grid-cols-4 gap-3">
          {MODAL_CHECKOUT_STEPS.map((item, index) => {
            const isActive = index === activeIndex;
            const isComplete = index < activeIndex;
            const canNavigate = isComplete;
            const stepNumber = index + 1;

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
                  'group flex flex-col items-center gap-2 text-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50 rounded-xl disabled:cursor-default',
                  canNavigate && 'cursor-pointer'
                )}
                aria-disabled={!canNavigate}
              >
                {/* Numbered Circle */}
                <div className="relative">
                  <div
                    className={clsx(
                      'flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all duration-500',
                      isComplete && [
                        'bg-emerald-400 text-slate-900 shadow-[0_0_20px_rgba(52,211,153,0.6)]',
                      ],
                      isActive && [
                        'bg-purple-500 text-white shadow-[0_0_25px_rgba(139,92,246,0.7)]',
                        'motion-safe:animate-pulse',
                      ],
                      !isActive && !isComplete && ['bg-white/10 text-white/30']
                    )}
                  >
                    {isComplete ? (
                      <span className="motion-safe:animate-scale-in">✓</span>
                    ) : (
                      stepNumber
                    )}
                  </div>
                </div>

                {/* Step Label */}
                <p
                  className={clsx(
                    'text-xs font-semibold uppercase leading-snug tracking-[0.08em] transition-colors',
                    isActive && 'text-white',
                    isComplete && !isActive && 'text-emerald-100',
                    !isActive && !isComplete && 'text-white/35'
                  )}
                >
                  {item.label}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const CanvasCheckoutStepIndicator = memo(CanvasCheckoutStepIndicatorComponent);

export default CanvasCheckoutStepIndicator;
