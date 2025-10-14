import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

type TokenDecrementToastProps = {
  visible: boolean;
  remaining: number | null;
  onClose: () => void;
};

const TokenDecrementToast = ({ visible, remaining, onClose }: TokenDecrementToastProps) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    if (visible) {
      // Generate random particle positions
      const newParticles = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: Math.random() * 60 - 30,
        y: Math.random() * 40 - 20,
      }));
      setParticles(newParticles);

      // Auto-close after 2 seconds
      const timer = setTimeout(onClose, 2000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  const displayRemaining = remaining == null ? '∞' : Math.max(0, remaining);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="pointer-events-none fixed left-1/2 top-24 z-[100] -translate-x-1/2"
        >
          {/* Particles */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0.5],
                x: particle.x,
                y: particle.y,
              }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400" />
            </motion.div>
          ))}

          {/* Toast Card */}
          <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-slate-900/95 via-purple-900/95 to-indigo-900/95 shadow-[0_20px_70px_rgba(139,92,246,0.5)] backdrop-blur-xl">
            {/* Shimmer effect */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            />

            <div className="relative z-10 flex items-center gap-4 px-6 py-4">
              {/* Icon */}
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/30 to-indigo-500/30 border border-purple-400/40">
                <Sparkles className="h-5 w-5 text-purple-300" />
              </div>

              {/* Content */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <motion.span
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-2xl font-bold text-white"
                  >
                    −1
                  </motion.span>
                  <span className="text-sm font-semibold uppercase tracking-wider text-white/70">
                    Token
                  </span>
                </div>
                <div className="text-xs text-white/60">
                  <span className="font-semibold text-purple-300">{displayRemaining}</span> remaining
                </div>
              </div>

              {/* Decorative glow */}
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-purple-500/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-indigo-500/20 blur-3xl" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TokenDecrementToast;
