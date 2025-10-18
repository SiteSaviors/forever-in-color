import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Lock } from 'lucide-react';
import { clsx } from 'clsx';
import type { ToneSection as ToneSectionType } from '@/store/hooks/useToneSections';
import type { ToneGradientConfig } from '@/config/toneGradients';
import ToneStyleCard from './ToneStyleCard';
import { getToneIcon } from './toneIcons';
import {
  toneCardVariants,
  tonePanelVariants,
  toneSectionVariants,
  reducedMotionSettings,
  toneCardStagger,
} from '../motion/toneAccordionMotion';

type ToneSectionProps = {
  section: ToneSectionType;
  toneMeta: ToneGradientConfig;
  prefersReducedMotion: boolean;
  onStyleSelect: (styleId: string, meta: { tone: string }) => void;
  isExpanded: boolean;
  onToggle: () => void;
};

export default function ToneSection({
  section,
  toneMeta,
  prefersReducedMotion,
  onStyleSelect,
  isExpanded,
  onToggle,
}: ToneSectionProps) {
  const { tone, definition, styles, locked } = section;
  const Icon = getToneIcon(tone);
  const [iconAnimated, setIconAnimated] = useState(false);

  useEffect(() => {
    if (isExpanded && !iconAnimated) {
      setIconAnimated(true);
    }
  }, [iconAnimated, isExpanded]);

  const panelBackground = isExpanded ? toneMeta.panel.expanded : toneMeta.panel.collapsed;

  return (
    <motion.section
      layout
      initial={false}
      variants={toneSectionVariants}
      animate={isExpanded ? 'expanded' : 'collapsed'}
      className={clsx(
        'relative overflow-hidden rounded-2xl border border-white/10 backdrop-blur-sm transition-all duration-300',
        isExpanded && 'shadow-[0_24px_48px_rgba(12,20,39,0.55)]'
      )}
      style={{ background: panelBackground }}
    >
      <div
        className={clsx(
          'absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-500',
          isExpanded && 'opacity-70'
        )}
          style={{
            background: `radial-gradient(140% 80% at 50% -20%, ${toneMeta.highlight} 0%, transparent 60%)`,
          }}
        aria-hidden="true"
      />

      <button
        onClick={onToggle}
        className={clsx(
          'relative w-full px-6 py-4 text-left transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
          'focus-visible:ring-white/70',
          isExpanded ? 'bg-white/10' : 'hover:bg-white/5'
        )}
        aria-expanded={isExpanded}
        aria-controls={`tone-section-${tone}`}
      >
        <div className="flex items-start gap-4">
          <span
            className={clsx(
              'mt-0.5 flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 shadow-inner text-white',
              !prefersReducedMotion && !iconAnimated && isExpanded ? 'animate-tone-icon-reveal' : ''
            )}
            style={{
              borderColor: toneMeta.keyline,
              boxShadow: `0 0 24px ${toneMeta.highlight}`,
            }}
            aria-hidden="true"
          >
            <Icon stroke={toneMeta.iconStroke} strokeWidth={1.5} className="h-6 w-6" />
          </span>
          <div className="flex flex-1 flex-col text-left">
            <div className="flex items-center gap-3">
              <h3
                className={clsx(
                  'text-sm font-bold uppercase tracking-[0.02em] text-white md:text-base font-fraunces'
                )}
              >
                {definition.label}
              </h3>
              {tone === 'trending' && (
                <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-rose-300 animate-pulse-slow">
                  Hot
                </span>
              )}
              {locked && tone === 'signature' && (
                <Lock className="h-4 w-4 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" aria-hidden="true" />
              )}
            </div>
            <p className="mt-1 text-xs text-white/75 md:text-sm md:leading-relaxed">
              {definition.description}
            </p>
          </div>
          <motion.span
            animate={isExpanded ? { rotate: 180 } : { rotate: 0 }}
            transition={prefersReducedMotion ? reducedMotionSettings : { type: 'spring', stiffness: 360, damping: 28 }}
            className="text-white/60"
            aria-hidden="true"
          >
            <ChevronDown className="h-5 w-5" />
          </motion.span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="panel"
            id={`tone-section-${tone}`}
            role="region"
            aria-label={`${definition.label} styles`}
            variants={tonePanelVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={prefersReducedMotion ? reducedMotionSettings : undefined}
            className="px-4 pb-5 pt-2"
          >
            <motion.div
              className="space-y-2"
              initial={prefersReducedMotion ? undefined : 'initial'}
              animate={prefersReducedMotion ? undefined : 'enter'}
              exit={prefersReducedMotion ? undefined : 'initial'}
              transition={prefersReducedMotion ? undefined : toneCardStagger}
            >
              {styles.map((styleEntry) => (
                <motion.div key={styleEntry.option.id} variants={toneCardVariants}>
                  <ToneStyleCard
                    styleEntry={styleEntry}
                    onSelect={() => onStyleSelect(styleEntry.option.id, { tone })}
                    prefersReducedMotion={prefersReducedMotion}
                  />
                </motion.div>
              ))}
              {styles.length === 0 && (
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-white/55">
                  No styles in this tone yet. Check back soon.
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
