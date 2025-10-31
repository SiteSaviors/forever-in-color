import { forwardRef, useMemo, useState, useEffect, useCallback, useRef } from 'react';
import type { MutableRefObject } from 'react';
import type { EntitlementState, StyleOption } from '@/store/founder/storeTypes';
import type { Orientation } from '@/utils/imageUtils';
import type { StudioToastPayload, UpgradePromptPayload } from '@/hooks/useStudioFeedback';
import { useHandleStyleSelect } from '@/sections/studio/hooks/useHandleStyleSelect';
import {
  getNarrative,
  getPalette,
  getComplementaryStyles,
  getShareCaption,
} from '@/utils/storyLayer/copy';
import StoryGateway from './StoryGateway';
import StoryCard from './StoryCard';
import PaletteStrip from './PaletteStrip';
import ComplementarySuggestions, { type Suggestion } from './ComplementarySuggestions';
import ShareCue, { type SocialChannel } from './ShareCue';
import {
  trackStoryImpression,
  trackPaletteHover,
  trackComplementaryClick,
  trackShareClick,
} from '@/utils/storyLayerAnalytics';
import { useStyleCatalogActions, useStyleCatalogState } from '@/store/hooks/useStyleCatalogStore';
import { usePreviewLockState } from '@/store/hooks/usePreviewStore';

type StoryLayerProps = {
  style: StyleOption;
  previewUrl: string;
  croppedImage?: string | null;
  orientation: Orientation;
  entitlements: EntitlementState;
  onToast?: (payload: StudioToastPayload) => void;
  onUpgradePrompt?: (payload: UpgradePromptPayload) => void;
};

const SOCIAL_DESCRIPTIONS: Record<SocialChannel, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  pinterest: 'Pinterest',
  twitter: 'X / Twitter',
};

const onSocialMessage = (channel: SocialChannel, toast?: (payload: StudioToastPayload) => void) => {
  toast?.({
    title: `${SOCIAL_DESCRIPTIONS[channel]} share`,
    description: 'Share-ready links are coming soon. Copy the caption in the meantime.',
    variant: 'info',
  });
};

const StoryLayer = forwardRef<HTMLDivElement, StoryLayerProps>(function StoryLayer(
  {
    style,
    previewUrl,
    orientation,
    entitlements,
    onToast,
    onUpgradePrompt,
  },
  ref
) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const mergeRefs = useCallback(
    (node: HTMLDivElement | null) => {
      sectionRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as MutableRefObject<HTMLDivElement | null>).current = node;
      }
    },
    [ref]
  );

  const { styles } = useStyleCatalogState();
  const { evaluateStyleGate } = useStyleCatalogActions();
  const { isLocked: previewLocked } = usePreviewLockState();
  const handleStyleSelect = useHandleStyleSelect({
    onGateDenied: ({ gate }) => {
      if (!onUpgradePrompt) return;
      onUpgradePrompt({
        title: 'Unlock Premium Style',
        description: gate.message ?? 'Upgrade to explore this premium Wondertone style without limits.',
        ctaLabel: 'View Plans',
      });
    },
  });

  // Lazy-load story data from registry
  const [narrative, setNarrative] = useState<Awaited<ReturnType<typeof getNarrative>> | null>(null);
  const [palette, setPalette] = useState<Awaited<ReturnType<typeof getPalette>> | null>(null);
  const [complementaryConfig, setComplementaryConfig] = useState<Awaited<ReturnType<typeof getComplementaryStyles>> | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      getNarrative(style),
      getPalette(style),
      getComplementaryStyles(style),
    ]).then(([narrativeData, paletteData, complementaryData]) => {
      if (!cancelled) {
        setNarrative(narrativeData);
        setPalette(paletteData);
        setComplementaryConfig(complementaryData);
      }
    }).catch((error) => {
      console.error('[StoryLayer] Failed to load story data:', error);
    });

    return () => {
      cancelled = true;
    };
  }, [style]);
  const toneShareCaption = useMemo(
    () =>
      getShareCaption({
        tone: style.tone ?? null,
        styleName: style.name,
        tier: entitlements.tier,
      }),
    [style, entitlements.tier]
  );

  const orientationKey = orientation;

  const analyticsContext = useMemo(
    () => ({
      styleId: style.id,
      tone: style.tone ?? null,
      userTier: entitlements.tier,
      orientation: orientationKey,
    }),
    [entitlements.tier, orientationKey, style.id, style.tone]
  );

  const [copyState, setCopyState] = useState<'idle' | 'success' | 'error'>('idle');
  const [impressionTracked, setImpressionTracked] = useState(false);

  useEffect(() => {
    if (copyState === 'idle') return undefined;
    const timer = window.setTimeout(() => setCopyState('idle'), 2500);
    return () => window.clearTimeout(timer);
  }, [copyState]);

  useEffect(() => {
    setImpressionTracked(false);
  }, [analyticsContext.styleId, analyticsContext.userTier, analyticsContext.orientation, analyticsContext.tone]);

  useEffect(() => {
    if (!sectionRef.current || impressionTracked) return;

    const node = sectionRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            trackStoryImpression({
              ...analyticsContext,
              timestamp: Date.now(),
            });
            setImpressionTracked(true);
          }
        });
      },
      { threshold: 0.35 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [analyticsContext, impressionTracked]);

  const complementarySuggestions = useMemo(() => {
    if (!complementaryConfig) return [];

    const ids = [complementaryConfig.premium, complementaryConfig.fallback].filter(
      (id): id is string => Boolean(id && id !== style.id)
    );

    const uniqueIds = Array.from(new Set(ids));
    const resolved = uniqueIds
      .map((id) => styles.find((candidate) => candidate.id === id))
      .filter((candidate): candidate is StyleOption => Boolean(candidate));

    const fallbackStyle = styles.find((candidate) => candidate.id === complementaryConfig.fallback);
    if (!resolved.length && fallbackStyle && fallbackStyle.id !== style.id) {
      resolved.push(fallbackStyle);
    }

    return resolved.map<Suggestion>((candidate) => {
      const gate = evaluateStyleGate(candidate.id);
      const allowed = gate.allowed;
      const isFallback = candidate.id === complementaryConfig.fallback;
      const subtitle = isFallback
        ? 'A free companion that keeps the same mood for your set.'
        : 'Unlock a premium complement for a cohesive gallery wall.';

      return {
        id: candidate.id,
        style: candidate,
        subtitle,
        isPremium: candidate.isPremium,
        isFallback,
        allowed,
        lockedMessage: gate.message ?? null,
        requiredTier: gate.requiredTier ?? null,
      } satisfies Suggestion;
    });
  }, [complementaryConfig, evaluateStyleGate, style.id, styles]);

  const isPremiumTier = entitlements.tier !== 'free';

  const fallbackCopy = useCallback((text: string) => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.top = '-1000px';
      textarea.style.left = '-1000px';
      textarea.setAttribute('readonly', 'true');
      document.body.appendChild(textarea);
      textarea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      return successful;
    } catch (error) {
      console.warn('[StoryLayer] Legacy copy fallback failed', error);
      return false;
    }
  }, []);

  const handleCopyCaption = useCallback(async () => {
    try {
      let copied = false;
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(toneShareCaption);
        copied = true;
      } else {
        copied = fallbackCopy(toneShareCaption);
      }

      if (!copied) {
        throw new Error('Clipboard unavailable');
      }

      setCopyState('success');
      onToast?.({
        title: 'Caption copied',
        description: 'Paste it into Instagram, TikTok, or your group chat.',
        variant: 'success',
      });
      trackShareClick({
        ...analyticsContext,
        action: 'caption',
      });
    } catch (error) {
      console.warn('[StoryLayer] clipboard copy failed', error);
      setCopyState('error');
      onToast?.({
        title: 'Copy unavailable',
        description: 'Clipboard access was blocked. Long press to copy manually.',
        variant: 'warning',
      });
    }
  }, [analyticsContext, fallbackCopy, onToast, toneShareCaption]);

  const handleDownloadShareCard = useCallback(() => {
    onUpgradePrompt?.({
      title: 'Unlock Story Cards',
      description: 'Upgrade to Creator to download watermark-free, share-ready story cards.',
      ctaLabel: 'Upgrade Now',
    });
    trackShareClick({
      ...analyticsContext,
      action: 'download',
    });
  }, [analyticsContext, onUpgradePrompt]);

  const handleComplementarySelect = useCallback(
    (styleId: string, tone?: string | null) => {
      if (previewLocked) {
        onToast?.({
          title: 'Preview in progress',
          description: 'Finish your current Wondertone preview to explore more styles.',
          variant: 'info',
        });
        return;
      }
      trackComplementaryClick({
        ...analyticsContext,
        targetStyleId: styleId,
        allowed: true,
        isFallback: styleId === complementaryConfig.fallback,
      });
      handleStyleSelect(styleId, { tone });
    },
    [analyticsContext, complementaryConfig.fallback, handleStyleSelect, onToast, previewLocked]
  );

  const handleComplementaryUpgrade = useCallback(
    (suggestion: Suggestion) => {
      onUpgradePrompt?.({
        title: 'Unlock Premium Companion',
        description:
          suggestion.lockedMessage ?? 'Upgrade your plan to explore this Wondertone premium companion style.',
        ctaLabel: 'View Plans',
      });
      trackComplementaryClick({
        ...analyticsContext,
        targetStyleId: suggestion.style.id,
        allowed: false,
        isFallback: suggestion.isFallback,
        requiredTier: suggestion.requiredTier ?? undefined,
      });
    },
    [analyticsContext, onUpgradePrompt]
  );

  const handleSocialShare = useCallback(
    (channel: SocialChannel) => {
      onSocialMessage(channel, onToast);
      trackShareClick({
        ...analyticsContext,
        action: 'social',
        channel,
      });
    },
    [analyticsContext, onToast]
  );

  // Show loading placeholder if story data not yet loaded
  if (!narrative || !palette) {
    return (
      <section ref={mergeRefs} className="space-y-8 sm:space-y-10 text-white animate-pulse">
        <div className="h-8 bg-white/10 rounded w-3/4"></div>
        <div className="h-32 bg-white/10 rounded"></div>
        <div className="h-16 bg-white/10 rounded"></div>
      </section>
    );
  }

  return (
    <section ref={mergeRefs} className="space-y-8 sm:space-y-10 text-white">
      <StoryGateway styleName={style.name} />
      <StoryCard previewUrl={previewUrl} narrative={narrative} styleName={style.name} />
      <PaletteStrip
        swatches={palette}
        onSwatchHover={(swatch) =>
          trackPaletteHover({
            ...analyticsContext,
            swatchId: swatch.id,
          })
        }
      />
      <ComplementarySuggestions
        suggestions={complementarySuggestions}
        onSelect={handleComplementarySelect}
        onRequestUpgrade={handleComplementaryUpgrade}
      />
      <ShareCue
        caption={toneShareCaption}
        copyState={copyState}
        onCopy={handleCopyCaption}
        onDownload={handleDownloadShareCard}
        isPremiumTier={isPremiumTier}
        onSocialShare={handleSocialShare}
      />
    </section>
  );
});

export default StoryLayer;
