import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

type CanvasUpsellToastProps = {
  show: boolean;
  onDismiss: () => void;
  onCanvasClick: () => void;
};

export default function CanvasUpsellToast({ show, onDismiss, onCanvasClick }: CanvasUpsellToastProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md mx-4"
        >
          <div className="relative bg-gradient-to-r from-purple-500 to-blue-500 text-white p-5 rounded-xl shadow-glow-purple border-2 border-purple-400/60">
            <button
              onClick={onDismiss}
              className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
            <p className="font-bold text-sm mb-1 pr-6">Love this artwork?</p>
            <p className="text-xs text-white/90 mb-4">
              Turn it into a premium canvas print and bring it to life in your space.
            </p>
            <button
              onClick={onCanvasClick}
              className="w-full bg-white text-purple-600 font-bold py-2.5 px-4 rounded-lg hover:bg-white/90 transition-all text-sm shadow-lg"
            >
              Explore Canvas Options →
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
