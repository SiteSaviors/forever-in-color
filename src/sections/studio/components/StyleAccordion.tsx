import { useState, useEffect, useCallback, useMemo, type CSSProperties } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { useToneSections } from '@/store/hooks/useToneSections';
import { useHandleStyleSelect } from '@/sections/studio/hooks/useHandleStyleSelect';
import { useStudioFeedback } from '@/hooks/useStudioFeedback';
import { emitStepOneEvent } from '@/utils/telemetry';
import ToneSection from './ToneSection';
import type { StyleTone } from '@/config/styleCatalog';
import type { GateResult } from '@/utils/entitlementGate';
import type { ToneSection as ToneSectionType } from '@/store/hooks/useToneSections';
import { TONE_GRADIENTS } from '@/config/toneGradients';

type StyleAccordionProps = {
  hasCroppedImage: boolean;
};

export default function StyleAccordion({ hasCroppedImage }: StyleAccordionProps) {
  const toneSections = useToneSections();
  const { showUpgradeModal } = useStudioFeedback();
  const prefersReducedMotion = useReducedMotion();

  // Single active tone (true accordion behavior - only one open)
  const [activeTone, setActiveTone] = useState<StyleTone | null>('trending');

  // Track prefetched sections to prevent duplicate requests
  const [prefetchedSections, setPrefetchedSections] = useState<Set<StyleTone>>(new Set());

  // Trending tooltip state for first-time users
  const [showTrendingTip, setShowTrendingTip] = useState(false);

  // Direct thumbnail prefetching with tracking - FIXED: Memory leak prevention
  const prefetchThumbnails = useCallback((section: ToneSectionType) => {
    if (prefetchedSections.has(section.tone)) {
      return; // Already prefetched, skip
    }

    section.styles.forEach(({ option }) => {
      const img = new Image();
      img.src = option.thumbnail;
      // Preload eagerly - browser will cache for instant display
    });

    setPrefetchedSections((prev) => new Set(prev).add(section.tone));
  }, [prefetchedSections]);

  // Prefetch thumbnails for initially expanded section - FIXED: Dependencies
  useEffect(() => {
    if (activeTone) {
      const section = toneSections.find((s) => s.tone === activeTone);
      if (section) {
        prefetchThumbnails(section);
      }
    }
  }, [activeTone, toneSections, prefetchThumbnails]);

  // Emit view telemetry when a new tone expands
  useEffect(() => {
    if (!activeTone) return;
    emitStepOneEvent({ type: 'tone_section_view', tone: activeTone });
  }, [activeTone]);

  // Auto-expand Trending with tooltip for first-time users
  useEffect(() => {
    const hasSeenTip = localStorage.getItem('hasSeenTrendingTip');

    if (!hasSeenTip && hasCroppedImage) {
      // Show tooltip after 300ms delay for gentle entry
      const showTimer = setTimeout(() => setShowTrendingTip(true), 300);

      // Auto-dismiss after 5s
      const dismissTimer = setTimeout(() => {
        setShowTrendingTip(false);
        localStorage.setItem('hasSeenTrendingTip', 'true');
      }, 5300); // 300ms delay + 5000ms display

      return () => {
        clearTimeout(showTimer);
        clearTimeout(dismissTimer);
      };
    }
  }, [hasCroppedImage]);

  const handleDismissTip = () => {
    setShowTrendingTip(false);
    localStorage.setItem('hasSeenTrendingTip', 'true');
  };

  // Handle gate denials - FIXED: Correct modal signature + analytics
  const handleGateDenied = (gate: GateResult, styleId: string, tone: string) => {
    if (gate.reason === 'quota_exceeded') {
      showUpgradeModal({
        title: 'Out of Generations',
        description: gate.message || "You've used all your generations this month. Upgrade to continue creating.",
        ctaLabel: gate.ctaText || 'Upgrade Now',
      });
    } else if (gate.reason === 'style_locked') {
      showUpgradeModal({
        title: 'Premium Style',
        description: gate.message || `"${styleId}" requires ${gate.requiredTier?.toUpperCase()} tier or higher.`,
        ctaLabel: gate.ctaText || `Upgrade to ${gate.requiredTier?.toUpperCase()}`,
      });
      emitStepOneEvent({
        type: 'tone_upgrade_prompt',
        styleId,
        tone,
        requiredTier: gate.requiredTier ?? null,
      });
    } else if (gate.reason === 'entitlements_loading') {
      // Silent - loading state
      return;
    } else {
      // Fallback for other gate reasons
      showUpgradeModal({
        title: 'Unable to Generate',
        description: gate.message || 'Please try again or upgrade your account.',
        ctaLabel: 'View Plans',
      });
    }

    // FIXED: Correct analytics event shape
    emitStepOneEvent({
      type: 'tone_style_locked',
      styleId: styleId,
      requiredTier: gate.requiredTier ?? null,
    });
  };

  // FIXED: Use callback from useHandleStyleSelect for gate handling
  const handleStyleSelect = useHandleStyleSelect({
    onGateDenied: ({ gate, styleId, tone }) => {
      handleGateDenied(gate, styleId, tone ?? 'unknown');
    },
  });

  const toggleTone = (tone: StyleTone) => {
    const wasExpanded = activeTone === tone;

    // True accordion: clicking same section closes it, clicking different opens it
    setActiveTone((prev) => (prev === tone ? null : tone));

    // REMOVED: Invalid analytics event type 'tone_section_expanded' doesn't exist
    // Can add to telemetry.ts union if needed for tracking

    // Prefetch thumbnails when section opens
    if (!wasExpanded) {
      const section = toneSections.find((s) => s.tone === tone);
      if (section) {
        prefetchThumbnails(section);
      }
    }
  };

  const toneAmbientStyle = useMemo(() => {
    if (!activeTone) return undefined;
    const ambient = TONE_GRADIENTS[activeTone]?.ambient;
    if (!ambient) return undefined;
    const style: CSSProperties = {
      '--tone-ambient-from': ambient.from,
      '--tone-ambient-via': ambient.via,
      '--tone-ambient-to': ambient.to,
    };
    return style;
  }, [activeTone]);

  return (
    <div
      className="relative space-y-4"
      style={toneAmbientStyle}
    >
      <div
        className={clsx(
          'pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[1.75rem]',
          activeTone ? 'opacity-100' : 'opacity-0',
          prefersReducedMotion ? '' : 'animate-tone-ambient-pulse'
        )}
        aria-hidden="true"
      >
        <div
          className="absolute inset-0 blur-3xl opacity-60"
          style={{
            background: `radial-gradient(120% 80% at 0% 0%, var(--tone-ambient-from, rgba(59,130,246,0.12)), transparent 68%),
              radial-gradient(120% 80% at 100% 0%, var(--tone-ambient-via, rgba(139,92,246,0.12)), transparent 70%),
              radial-gradient(160% 120% at 50% 100%, var(--tone-ambient-to, rgba(56,189,248,0.12)), transparent 72%)`,
          }}
        />
      </div>

      <AnimatePresence initial={false}>
        {toneSections.map((section) => (
          <motion.div
            key={section.tone}
            layout
            initial={false}
            className="relative"
          >
            {/* Trending tooltip for first-time users */}
            {section.tone === 'trending' && showTrendingTip && (
              <div
                className={clsx(
                  'absolute -top-20 left-0 right-0 z-30 px-4 animate-in fade-in-0 slide-in-from-top-2 duration-300'
                )}
              >
                <div
                  className={clsx(
                    'relative px-4 py-3 rounded-xl',
                    'bg-slate-900/95 backdrop-blur-md',
                    'border border-purple-400/30',
                    'text-sm text-white',
                    'shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
                  )}
                >
                  <button
                    onClick={handleDismissTip}
                    className="absolute top-2 right-2 text-white/60 hover:text-white transition-colors"
                    aria-label="Dismiss tooltip"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <p className="pr-6 leading-relaxed text-sm font-medium">
                    <span className="mr-2">👋</span>
                    Start here — most-loved styles this week
                  </p>

                  {/* Arrow pointing to Trending section */}
                  <div
                    className="absolute -bottom-2 left-8 w-4 h-4 bg-slate-900 border-r border-b border-purple-400/30 rotate-45 -z-10"
                  />
                </div>
              </div>
            )}

            <ToneSection
              section={section}
              toneMeta={TONE_GRADIENTS[section.tone]}
              prefersReducedMotion={prefersReducedMotion}
              onStyleSelect={(styleId, meta) => {
                handleStyleSelect(styleId, meta);
              }}
              isExpanded={activeTone === section.tone}
              onToggle={() => toggleTone(section.tone)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
