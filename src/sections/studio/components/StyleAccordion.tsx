import { useState, useEffect, useMemo, type CSSProperties } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { useToneSections } from '@/store/hooks/useToneSections';
import { useHandleStyleSelect } from '@/sections/studio/hooks/useHandleStyleSelect';
import { useStudioFeedback } from '@/hooks/useStudioFeedback';
import { emitStepOneEvent } from '@/utils/telemetry';
import { useStyleThumbnailPrefetch } from '@/sections/studio/hooks/useStyleThumbnailPrefetch';
import ToneSection from './ToneSection';
import type { PrefetchGroupStatus } from '@/sections/studio/hooks/useStyleThumbnailPrefetch';
import type { StyleTone } from '@/config/styleCatalog';
import type { GateResult } from '@/utils/entitlementGate';
import { TONE_GRADIENTS } from '@/config/toneGradients';
import './StyleAccordion.css';

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
  // Trending tooltip state for first-time users
  const [showTrendingTip, setShowTrendingTip] = useState(false);

  const prefetchGroups = useMemo(
    () =>
      toneSections.map((section) => ({
        id: section.tone,
        thumbnails: section.styles.map(({ option }) => option.thumbnail),
      })),
    [toneSections]
  );

  const { registerGroup, prefetchState, prefetchGroup } = useStyleThumbnailPrefetch({
    groups: prefetchGroups,
  });

  const prefetchGroupMap = useMemo(
    () => new Map(prefetchGroups.map((group) => [group.id, group])),
    [prefetchGroups]
  );

  useEffect(() => {
    if (!activeTone) return;
    const group = prefetchGroupMap.get(activeTone);
    if (group) {
      void prefetchGroup(group);
    }
  }, [activeTone, prefetchGroupMap, prefetchGroup]);

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

    if (!wasExpanded) {
      const group = prefetchGroupMap.get(tone);
      if (group) {
        void prefetchGroup(group);
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

  const ambientClasses = useMemo(
    () =>
      clsx(
        'tone-ambient-container relative space-y-4',
        activeTone ? 'visible' : '',
        prefersReducedMotion ? 'reduced-motion' : ''
      ),
    [activeTone, prefersReducedMotion]
  );

  return (
    <div className={ambientClasses} style={toneAmbientStyle}>
      <AnimatePresence initial={false}>
        {toneSections.map((section) => {
          const group = prefetchGroupMap.get(section.tone);
          const prefetchStatus: PrefetchGroupStatus = prefetchState[section.tone]?.status ?? 'idle';

          return (
            <motion.div
              key={section.tone}
              ref={group ? registerGroup(group) : undefined}
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
              prefetchStatus={prefetchStatus}
            />
          </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
