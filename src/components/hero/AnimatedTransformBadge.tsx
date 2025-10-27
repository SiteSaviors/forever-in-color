import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import clsx from 'clsx';
import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion';

const AnimatedTransformBadge = () => {
  const [count, setCount] = useState(0);
  const targetSeconds = 60;
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setCount(targetSeconds);
      return;
    }

    setCount(0);
    const duration = 2000; // 2 seconds to count up
    const increment = targetSeconds / (duration / 16); // ~60fps

    const timer = window.setInterval(() => {
      setCount((prev) => {
        const next = prev + increment;
        if (next >= targetSeconds) {
          window.clearInterval(timer);
          return targetSeconds;
        }
        return next;
      });
    }, 16);

    return () => window.clearInterval(timer);
  }, [prefersReducedMotion, targetSeconds]);

  return (
    <div
      className={clsx(
        'relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-400/30 px-5 py-2.5 shadow-lg backdrop-blur-sm',
        !prefersReducedMotion && 'animate-badge-fade-in'
      )}
    >
      {/* Pulsing background effect */}
      <div
        className={clsx(
          'absolute inset-0 rounded-full bg-emerald-400/20',
          !prefersReducedMotion && 'animate-badge-pulse'
        )}
      />

      {/* Icon */}
      <div
        className={clsx('relative z-10', !prefersReducedMotion && 'animate-badge-tilt')}
      >
        <Zap className="h-5 w-5 fill-emerald-400 text-emerald-400 relative z-10" />
      </div>

      {/* Text */}
      <div className="flex items-center gap-1.5 relative z-10">
        <span className="font-poppins text-sm font-semibold text-emerald-300">Transforms in</span>
        <span className="font-poppins text-base font-bold text-white tabular-nums">
          {Math.round(count)} seconds
        </span>
      </div>
    </div>
  );
};

export default AnimatedTransformBadge;
