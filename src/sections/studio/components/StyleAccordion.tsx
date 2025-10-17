import { useState, useEffect, useCallback } from 'react';
import { useToneSections } from '@/store/hooks/useToneSections';
import { useHandleStyleSelect } from '@/sections/studio/hooks/useHandleStyleSelect';
import { useStudioFeedback } from '@/hooks/useStudioFeedback';
import { emitStepOneEvent } from '@/utils/telemetry';
import ToneSection from './ToneSection';
import type { StyleTone } from '@/config/styleCatalog';
import type { GateResult } from '@/utils/entitlementGate';
import type { ToneSection as ToneSectionType } from '@/store/hooks/useToneSections';

type StyleAccordionProps = {
  hasCroppedImage: boolean;
};

export default function StyleAccordion({ hasCroppedImage }: StyleAccordionProps) {
  const toneSections = useToneSections();
  const handleStyleSelect = useHandleStyleSelect();
  const { showUpgradeModal } = useStudioFeedback();

  // ✅ CORRECTED: Single active tone (true accordion behavior - only one open)
  const [activeTone, setActiveTone] = useState<StyleTone | null>('trending');

  // Direct thumbnail prefetching (no hook needed)
  const prefetchThumbnails = useCallback((section: ToneSectionType) => {
    section.styles.forEach(({ option }) => {
      const img = new Image();
      img.src = option.thumbnail;
      // Preload eagerly - browser will cache for instant display
    });
  }, []);

  // Prefetch thumbnails for initially expanded section
  useEffect(() => {
    if (activeTone) {
      const section = toneSections.find((s) => s.tone === activeTone);
      if (section) {
        prefetchThumbnails(section);
      }
    }
  }, []); // Only run once on mount

  // ✅ CORRECTED: Handle gate denials (locked styles)
  const handleGateDenied = (gate: GateResult, styleId: string, tone: string) => {
    if (gate.reason === 'quota_exceeded') {
      showUpgradeModal({
        title: 'Out of Generations',
        message: gate.message || "You've used all your generations this month. Upgrade to continue creating.",
        ctaText: gate.ctaText || 'Upgrade Now',
        reason: 'quota_exceeded',
      });
    } else if (gate.reason === 'style_locked') {
      showUpgradeModal({
        title: 'Premium Style',
        message: gate.message || `"${styleId}" requires ${gate.requiredTier?.toUpperCase()} tier or higher.`,
        ctaText: gate.ctaText || `Upgrade to ${gate.requiredTier?.toUpperCase()}`,
        reason: 'style_locked',
      });
    } else if (gate.reason === 'entitlements_loading') {
      // Silent - loading state
      return;
    } else {
      // Fallback for other gate reasons
      showUpgradeModal({
        title: 'Unable to Generate',
        message: gate.message || 'Please try again or upgrade your account.',
        ctaText: 'View Plans',
        reason: gate.reason,
      });
    }

    // ✅ CORRECTED: Emit analytics
    emitStepOneEvent({
      type: 'tone_style_locked',
      value: styleId,
      metadata: { tone, reason: gate.reason },
    });
  };

  const toggleTone = (tone: StyleTone) => {
    const wasExpanded = activeTone === tone;

    // True accordion: clicking same section closes it, clicking different opens it
    setActiveTone((prev) => (prev === tone ? null : tone));

    // ✅ CORRECTED: Emit analytics immediately (not in useEffect)
    if (!wasExpanded) {
      emitStepOneEvent({
        type: 'tone_section_expanded',
        value: tone,
      });

      // Prefetch thumbnails when section opens
      const section = toneSections.find((s) => s.tone === tone);
      if (section) {
        prefetchThumbnails(section);
      }
    }
  };

  return (
    <div className="space-y-2">
      {toneSections.map((section) => (
        <ToneSection
          key={section.tone}
          section={section}
          onStyleSelect={(styleId, meta) => {
            // ✅ CORRECTED: Check gate BEFORE calling handleStyleSelect
            const styleEntry = section.styles.find((s) => s.option.id === styleId);
            if (styleEntry && !styleEntry.gate.allowed) {
              handleGateDenied(styleEntry.gate, styleId, meta.tone);
              return; // Don't proceed with selection
            }

            // Gate passed, proceed with selection (with tone metadata)
            handleStyleSelect(styleId, meta);
          }}
          isExpanded={activeTone === section.tone}
          onToggle={() => toggleTone(section.tone)}
        />
      ))}
    </div>
  );
}
