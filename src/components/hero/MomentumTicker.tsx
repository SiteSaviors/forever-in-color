import { useEffect, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import clsx from 'clsx';
import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion';

type TickerMessage = {
  id: string;
  name: string;
  location: string;
  style: string;
};

const TICKER_MESSAGES: TickerMessage[] = [
  { id: '1', name: 'Leila', location: 'Toronto', style: 'Neon Splash' },
  { id: '2', name: 'Marcus', location: 'Austin', style: 'Classic Oil Painting' },
  { id: '3', name: 'Sofia', location: 'Barcelona', style: 'Watercolor Dreams' },
  { id: '4', name: 'Kenji', location: 'Tokyo', style: 'Pop Art Burst' },
  { id: '5', name: 'Amara', location: 'Lagos', style: 'Electric Bloom' },
  { id: '6', name: 'Liam', location: 'Dublin', style: 'Pastel Bliss' },
];

type MomentumTickerProps = {
  interval?: number;
  className?: string;
};

const MomentumTicker = ({ interval = 4000, className = '' }: MomentumTickerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentMessage = TICKER_MESSAGES[currentIndex];
  const prefersReducedMotion = usePrefersReducedMotion();
  const exitTimeoutRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const [phase, setPhase] = useState<'enter' | 'exit'>('enter');

  useEffect(() => {
    const advance = () => setCurrentIndex((prev) => (prev + 1) % TICKER_MESSAGES.length);

    const startAnimatedCycle = () => {
      setPhase('exit');
      exitTimeoutRef.current = window.setTimeout(() => {
        advance();
        setPhase('enter');
      }, 180);
    };

    if (prefersReducedMotion) {
      intervalRef.current = window.setInterval(advance, interval);
      return () => {
        if (intervalRef.current) window.clearInterval(intervalRef.current);
      };
    }

    intervalRef.current = window.setInterval(startAnimatedCycle, interval);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      if (exitTimeoutRef.current) window.clearTimeout(exitTimeoutRef.current);
    };
  }, [interval, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) {
      setPhase('enter');
      if (exitTimeoutRef.current) {
        window.clearTimeout(exitTimeoutRef.current);
        exitTimeoutRef.current = null;
      }
    }
  }, [prefersReducedMotion]);

  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />

      <div
        className={clsx(
          'relative min-h-[1.5rem] text-sm text-white/70',
          !prefersReducedMotion && 'transition-all duration-300 ease-out will-change-transform will-change-opacity',
          !prefersReducedMotion && phase === 'exit' ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
        )}
      >
        <span className="font-semibold text-white">{currentMessage.name}</span> in{' '}
        <span className="text-white/90">{currentMessage.location}</span> just generated{' '}
        <span className="text-purple-400 font-medium">{currentMessage.style}</span>
      </div>
    </div>
  );
};

export default MomentumTicker;
