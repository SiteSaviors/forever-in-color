import { useState } from 'react';
import { motion } from 'framer-motion';
import { useFounderStore } from '@/store/useFounderStore';

type StylePill = {
  id: string;
  name: string;
  tagline: string;
  thumbnail: string;
  previewImage: string;
};

type StylePillsProps = {
  pills: StylePill[];
  onStyleChange?: (styleId: string, previewImage: string) => void;
  className?: string;
};

const StylePills = ({ pills, onStyleChange, className = '' }: StylePillsProps) => {
  const [activeStyleId, setActiveStyleId] = useState(pills[0]?.id || '');
  const setPreselectedStyle = useFounderStore((state) => state.setPreselectedStyle);

  const handlePillClick = (pill: StylePill) => {
    setActiveStyleId(pill.id);
    setPreselectedStyle(pill.id);
    onStyleChange?.(pill.id, pill.previewImage);
  };

  const handleKeyDown = (e: React.KeyboardEvent, pill: StylePill) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handlePillClick(pill);
    }
  };

  return (
    <div className={`grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-2 sm:gap-3 px-4 max-w-xl sm:max-w-none mx-auto ${className}`}>
      {pills.map((pill) => {
        const isActive = activeStyleId === pill.id;

        return (
          <motion.button
            key={pill.id}
            type="button"
            onClick={() => handlePillClick(pill)}
            onKeyDown={(e) => handleKeyDown(e, pill)}
            className={`relative flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-full transition-all duration-300 ${
              isActive
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/30 scale-105'
                : 'bg-white/10 border border-white/20 text-white/80 hover:bg-white/15 hover:border-white/30 hover:text-white'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-pressed={isActive}
            aria-label={`Switch to ${pill.name} style`}
          >
            {/* Thumbnail */}
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 transition-colors flex-shrink-0 ${
                isActive ? 'border-white/50' : 'border-white/20'
              }`}
            >
              <img
                src={pill.thumbnail}
                alt={pill.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Text */}
            <div className="flex flex-col items-start text-left min-w-0 flex-1">
              <span className={`text-xs sm:text-sm font-semibold truncate w-full ${isActive ? 'text-white' : 'text-white/90'}`}>
                {pill.name}
              </span>
              <span className={`text-[10px] sm:text-xs truncate w-full ${isActive ? 'text-white/80' : 'text-white/60'}`}>
                {pill.tagline}
              </span>
            </div>

            {/* Active indicator */}
            {isActive && (
              <motion.div
                layoutId="activePill"
                className="absolute inset-0 rounded-full border-2 border-white/30"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
};

export default StylePills;
