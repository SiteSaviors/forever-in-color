import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const AnimatedTransformBadge = () => {
  const [count, setCount] = useState(0);
  const targetSeconds = 60;

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setCount(targetSeconds);
      return;
    }

    const duration = 2000; // 2 seconds to count up
    const increment = targetSeconds / (duration / 16); // ~60fps

    const timer = setInterval(() => {
      setCount((prev) => {
        const next = prev + increment;
        if (next >= targetSeconds) {
          clearInterval(timer);
          return targetSeconds;
        }
        return next;
      });
    }, 16);

    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/40 px-4 py-2 backdrop-blur-md shadow-[0_8px_32px_rgba(16,185,129,0.2)]"
    >
      <Sparkles className="w-4 h-4 text-emerald-300" />
      <span className="text-sm font-semibold text-white">
        Transforms in{' '}
        <span className="text-emerald-300 tabular-nums">
          {Math.round(count)}
        </span>{' '}
        seconds
      </span>
    </motion.div>
  );
};

export default AnimatedTransformBadge;
