import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

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
      className="relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-400/30 px-5 py-2.5 shadow-lg backdrop-blur-sm"
    >
      {/* Pulsing background effect */}
      <motion.div
        className="absolute inset-0 rounded-full bg-emerald-400/20"
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Icon */}
      <motion.div
        animate={{
          rotate: [0, -10, 10, -10, 0],
        }}
        transition={{
          duration: 0.5,
          delay: 0.5,
        }}
      >
        <Zap className="h-5 w-5 fill-emerald-400 text-emerald-400 relative z-10" />
      </motion.div>

      {/* Text */}
      <div className="flex items-center gap-1.5 relative z-10">
        <span className="font-poppins text-sm font-semibold text-emerald-300">Transforms in</span>
        <span className="font-poppins text-base font-bold text-white tabular-nums">
          {Math.round(count)} seconds
        </span>
      </div>
    </motion.div>
  );
};

export default AnimatedTransformBadge;
