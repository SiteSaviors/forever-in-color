import { X } from 'lucide-react';
import { clsx } from 'clsx';
import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion';
import { useTransitionPresence } from '@/hooks/useTransitionPresence';
import './CanvasUpsellToast.css';

type CanvasUpsellToastProps = {
  show: boolean;
  onDismiss: () => void;
  onCanvasClick: () => void;
};

export default function CanvasUpsellToast({ show, onDismiss, onCanvasClick }: CanvasUpsellToastProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { mounted, state } = useTransitionPresence(show, {
    enterDuration: 220,
    exitDuration: 200,
    reduceMotion: prefersReducedMotion,
  });

  if (!mounted) return null;

  return (
    <div
      className={clsx(
        'canvas-upsell-toast',
        prefersReducedMotion && 'canvas-upsell-toast--reduced'
      )}
      data-state={state}
    >
      <div className="canvas-upsell-toast__card">
        <button
          onClick={onDismiss}
          className="canvas-upsell-toast__dismiss"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
        <p className="canvas-upsell-toast__headline">Love this artwork?</p>
        <p className="canvas-upsell-toast__description">
          Turn it into a premium canvas print and bring it to life in your space.
        </p>
        <button
          onClick={onCanvasClick}
          className="canvas-upsell-toast__cta"
        >
          Explore Canvas Options →
        </button>
      </div>
    </div>
  );
}
