import { useMemo } from 'react';
import { STYLE_TONE_DEFINITIONS, STYLE_TONES_IN_ORDER, type StyleTone, type StyleToneDefinition } from '@/config/styleCatalog';
import type { GateResult } from '@/utils/entitlementGate';
import { findStyleMetadata } from '@/utils/entitlementGate';
import { useFounderStore, type StyleOption } from '@/store/useFounderStore';

export type ToneSectionStyle = {
  option: StyleOption;
  metadataTone: StyleTone;
  gate: GateResult;
  isSelected: boolean;
  isFavorite: boolean;
};

export type ToneSection = {
  tone: StyleTone;
  definition: StyleToneDefinition;
  styles: ToneSectionStyle[];
  locked: boolean;
  lockedGate?: GateResult;
};

export const useToneSections = (): ToneSection[] => {
  const {
    styles,
    selectedStyleId,
    evaluateStyleGate,
    favoriteStyles,
    entitlementsTier,
    entitlementsStatus,
    entitlementsRemainingTokens,
    entitlementsRequiresWatermark,
    entitlementsLastSyncedAt,
  } = useFounderStore((state) => ({
    styles: state.styles,
    selectedStyleId: state.selectedStyleId,
    evaluateStyleGate: state.evaluateStyleGate,
    favoriteStyles: state.favoriteStyles,
    entitlementsTier: state.entitlements.tier,
    entitlementsStatus: state.entitlements.status,
    entitlementsRemainingTokens: state.entitlements.remainingTokens,
    entitlementsRequiresWatermark: state.entitlements.requiresWatermark,
    entitlementsLastSyncedAt: state.entitlements.lastSyncedAt,
  }));

  const favoriteSet = useMemo(() => {
    return new Set(favoriteStyles.map((id) => id.trim().toLowerCase()).filter(Boolean));
  }, [favoriteStyles]);

  const entitlementsContext = useMemo(
    () => ({
      tier: entitlementsTier,
      status: entitlementsStatus,
      remainingTokens: entitlementsRemainingTokens,
      requiresWatermark: entitlementsRequiresWatermark,
      lastSyncedAt: entitlementsLastSyncedAt,
    }),
    [
      entitlementsTier,
      entitlementsStatus,
      entitlementsRemainingTokens,
      entitlementsRequiresWatermark,
      entitlementsLastSyncedAt,
    ]
  );

  const defaultGate = useMemo(
    () => {
      // Access status to tie memoization to entitlement changes
      void entitlementsContext.status;
      return evaluateStyleGate(null);
    },
    [
      evaluateStyleGate,
      entitlementsContext,
    ]
  );

  const gateCache = useMemo(() => {
    // Access lastSyncedAt to tie memoization to entitlement updates
    void entitlementsContext.lastSyncedAt;
    const cache = new Map<string, GateResult>();
    styles.forEach((style) => {
      if (style.id === 'original-image') {
        return;
      }
      cache.set(style.id, evaluateStyleGate(style.id));
    });
    return cache;
  }, [styles, evaluateStyleGate, entitlementsContext]);

  return useMemo(() => {
    const toneBuckets = new Map<StyleTone, ToneSectionStyle[]>();

    styles.forEach((style) => {
      // Skip original-image - it's handled separately in OriginalImageCard
      if (style.id === 'original-image') {
        return;
      }

      const metadata = findStyleMetadata(style.id);
      const tone: StyleTone = metadata?.tone ?? 'classic';
      const gate = gateCache.get(style.id) ?? defaultGate;
      const isSelected = selectedStyleId === style.id;
      const normalizedId = style.id.trim().toLowerCase();
      const isFavorite = favoriteSet.has(normalizedId);

      const entry: ToneSectionStyle = {
        option: style,
        metadataTone: tone,
        gate,
        isSelected,
        isFavorite,
      };

      if (!toneBuckets.has(tone)) {
        toneBuckets.set(tone, []);
      }
      toneBuckets.get(tone)?.push(entry);
    });

    return STYLE_TONES_IN_ORDER.map((tone) => {
      const definition = STYLE_TONE_DEFINITIONS[tone];
      const items = toneBuckets.get(tone) ?? [];

      const locked = items.length > 0 ? !items.some((entry) => entry.gate.allowed) : false;
      const lockedGate = locked
        ? items.find((entry) => !entry.gate.allowed)?.gate ?? defaultGate
        : undefined;

      return {
        tone,
        definition,
        styles: items,
        locked,
        lockedGate,
      };
    });
  }, [styles, selectedStyleId, favoriteSet, gateCache, defaultGate]);
};
