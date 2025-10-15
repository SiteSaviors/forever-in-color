import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TICKER_MESSAGES.length);
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);

  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentMessage.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-sm text-white/70"
        >
          <span className="font-semibold text-white">{currentMessage.name}</span> in{' '}
          <span className="text-white/90">{currentMessage.location}</span> just generated{' '}
          <span className="text-purple-400 font-medium">{currentMessage.style}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MomentumTicker;
