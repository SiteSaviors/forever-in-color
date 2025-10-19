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
  const { styles, selectedStyleId, evaluateStyleGate, favoriteStyles } = useFounderStore((state) => ({
    styles: state.styles,
    selectedStyleId: state.selectedStyleId,
    evaluateStyleGate: state.evaluateStyleGate,
    favoriteStyles: state.favoriteStyles,
  }));

  const favoriteSet = useMemo(() => {
    return new Set(favoriteStyles.map((id) => id.trim().toLowerCase()).filter(Boolean));
  }, [favoriteStyles]);

  const defaultGate = useMemo(() => evaluateStyleGate(null), [evaluateStyleGate]);

  const gateCache = useMemo(() => {
    const cache = new Map<string, GateResult>();
    styles.forEach((style) => {
      if (style.id === 'original-image') {
        return;
      }
      cache.set(style.id, evaluateStyleGate(style.id));
    });
    return cache;
  }, [styles, evaluateStyleGate]);

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
