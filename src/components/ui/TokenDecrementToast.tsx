import { useEffect, useState, type CSSProperties } from 'react';
import { Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion';
import { useTransitionPresence } from '@/hooks/useTransitionPresence';
import './TokenDecrementToast.css';

type TokenDecrementToastProps = {
  visible: boolean;
  remaining: number | null;
  onClose: () => void;
};

const TokenDecrementToast = ({ visible, remaining, onClose }: TokenDecrementToastProps) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { mounted, state } = useTransitionPresence(visible, {
    enterDuration: 220,
    exitDuration: 180,
    reduceMotion: prefersReducedMotion,
  });

  useEffect(() => {
    if (visible) {
      if (!prefersReducedMotion) {
        const newParticles = Array.from({ length: 8 }, (_, i) => ({
          id: i,
          x: Math.random() * 60 - 30,
          y: Math.random() * 40 - 20,
        }));
        setParticles(newParticles);
      } else {
        setParticles([]);
      }

      const timer = setTimeout(onClose, 2000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose, prefersReducedMotion]);

  const displayRemaining = remaining == null ? '∞' : Math.max(0, remaining);

  if (!mounted) {
    return null;
  }

  const containerClass = clsx(
    'token-toast-container',
    prefersReducedMotion && 'token-toast-container--reduced'
  );

  return (
    <div className={containerClass} data-state={state}>
      {!prefersReducedMotion &&
        particles.map((particle) => (
          <div
            key={particle.id}
            className="token-toast__particle"
            style={
              {
                '--dx': `${particle.x}px`,
                '--dy': `${particle.y}px`,
              } as CSSProperties
            }
          >
            <div className="token-toast__particle-dot" />
          </div>
        ))}

      <div className="token-toast">
        {!prefersReducedMotion && <div className="token-toast__shimmer" />}
        <div className="token-toast__body">
          <div className="token-toast__icon">
            <Sparkles className="h-5 w-5 text-purple-300" />
          </div>
          <div className="token-toast__content">
            <span className="token-toast__delta">−1</span>
            <span className="token-toast__label">Token</span>
            <div className="token-toast__remaining">
              <span className="token-toast__remaining-value">{displayRemaining}</span> remaining
            </div>
          </div>
          <div className="token-toast__glow token-toast__glow--right" />
          <div className="token-toast__glow token-toast__glow--left" />
        </div>
      </div>
    </div>
  );
};

export default TokenDecrementToast;
