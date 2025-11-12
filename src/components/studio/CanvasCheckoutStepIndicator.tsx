import { memo, useEffect, useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { shallow } from 'zustand/shallow';
import { type CheckoutStep, useCheckoutStore } from '@/store/useCheckoutStore';

export const MODAL_CHECKOUT_STEPS: Array<{
  id: CheckoutStep;
  label: string;
  description: string;
}> = [
  { id: 'canvas', label: 'Create Your Masterpiece', description: 'Setup' },
  { id: 'contact', label: 'Contact\nInfo', description: 'Who' },
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

  const dynamicMessage = useMemo(() => {
    if (elapsedSeconds < 120) return '≈2 minutes total';
    return 'Looking perfect so far';
  }, [elapsedSeconds]);

  return (
    <div className="space-y-4">
      {/* Mobile: Compact dots with counter */}
      <div className="flex lg:hidden items-center justify-between px-1">
        <span className="text-xs text-white/60 font-medium">Only 4 steps</span>
        <div className="flex items-center gap-2">
          {MODAL_CHECKOUT_STEPS.map((_, i) => (
            <div
              key={i}
              className={clsx(
                'h-2 w-2 rounded-full transition-all duration-300',
                i < activeIndex && 'bg-emerald-400',
                i === activeIndex && 'bg-purple-400 ring-4 ring-purple-400/20 scale-125',
                i > activeIndex && 'bg-white/20'
              )}
            />
          ))}
          <span className="text-xs text-white/60 font-medium ml-1">
            {activeIndex + 1} / 4
          </span>
        </div>
      </div>

      {/* Desktop: Luminescent Spine */}
      <div className="hidden lg:block">
        {/* Header Copy */}
        <div className="flex items-center justify-between font-poppins text-xs text-white/60 px-1 font-medium mb-2">
          <span>Only 4 curated steps</span>
          <span className="text-white/50">{dynamicMessage}</span>
        </div>

        {/* Spine Capsule */}
        <div className="relative overflow-visible rounded-full border border-white/10 bg-white/5 px-4 py-1.5">
          {/* Connecting Line - Background */}
          <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-0.5 bg-white/10" />

          {/* Connecting Line - Progress Gradient */}
          <div
            className="pointer-events-none absolute left-8 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-purple-400 via-fuchsia-400 to-emerald-300 transition-[width] duration-700"
            style={{
              width: `calc(${progress}% * (100% - 64px) / 100)`,
              transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          />

          {/* Shimmer Effect */}
          <div className="pointer-events-none absolute left-8 right-8 top-1/2 -translate-y-1/2 h-0.5 overflow-hidden">
            <div
              className="absolute h-full w-24 bg-gradient-to-r from-transparent via-white/40 to-transparent motion-safe:animate-[shimmer-sweep_3s_ease-in-out_infinite]"
              style={{
                animation: 'shimmer-sweep 3s ease-in-out infinite',
              }}
            />
          </div>

          {/* Nodes Container */}
          <div className="relative flex items-center justify-between">
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
                <div key={item.id} className="relative flex flex-col items-center">
                  {/* Node Circle */}
                  <button
                    type="button"
                    onClick={handleClick}
                    disabled={!canNavigate}
                    aria-current={isActive ? 'step' : undefined}
                    aria-disabled={!canNavigate}
                    className={clsx(
                      'relative flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
                      isComplete && [
                        'bg-emerald-400 text-slate-900 shadow-[0_0_20px_rgba(52,211,153,0.6)]',
                        'cursor-pointer hover:scale-105 hover:shadow-[0_0_30px_rgba(52,211,153,0.8)]',
                      ],
                      isActive && [
                        'bg-purple-500 text-white shadow-[0_0_25px_rgba(139,92,246,0.7)]',
                        'motion-safe:animate-pulse',
                      ],
                      !isActive && !isComplete && ['bg-white/10 text-white/30 cursor-default']
                    )}
                  >
                    {isComplete ? (
                      <span className="motion-safe:animate-scale-in">✓</span>
                    ) : isActive ? (
                      <span className="relative">
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-white" />
                        </span>
                        {stepNumber}
                      </span>
                    ) : (
                      stepNumber
                    )}
                  </button>

                  {/* Label Below */}
                  <p
                    className={clsx(
                      'absolute top-9 w-24 text-center text-[10px] font-semibold uppercase leading-tight tracking-wider whitespace-pre-line transition-colors',
                      isActive && 'text-white',
                      isComplete && !isActive && 'text-emerald-100',
                      !isActive && !isComplete && 'text-white/35'
                    )}
                  >
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Shimmer Keyframes */}
      <style jsx>{`
        @keyframes shimmer-sweep {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            transform: translateX(400%);
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          [style*='shimmer-sweep'] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};

const CanvasCheckoutStepIndicator = memo(CanvasCheckoutStepIndicatorComponent);

export default CanvasCheckoutStepIndicator;
