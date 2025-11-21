import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { shallow } from 'zustand/shallow';
import {
  STYLE_TONE_DEFINITIONS,
  STYLE_TONES_IN_ORDER,
  type StyleTone,
  type StyleToneDefinition,
} from '@/config/styleCatalog';
import { TRENDING_HERO_STYLES } from '@/config/trendingStyles';
import type { GateResult } from '@/utils/entitlementGate';
import { findStyleMetadata } from '@/utils/entitlementGate';
import { useFounderStore } from '@/store/useFounderStore';
import { usePreviewReadiness } from '@/store/hooks/usePreviewStore';
import type { StyleOption } from '@/store/founder/storeTypes';
import type { StylePreviewReadiness } from '@/store/selectors/previewReadiness';

export type ToneSectionStyle = {
  option: StyleOption;
  metadataTone: StyleTone;
  gate: GateResult;
  isSelected: boolean;
  isFavorite: boolean;
  readiness: StylePreviewReadiness;
};

export type ToneSection = {
  tone: StyleTone;
  definition: StyleToneDefinition;
  styles: ToneSectionStyle[];
  locked: boolean;
  lockedGate?: GateResult;
};

export type ToneSectionsHookResult = {
  sections: ToneSection[];
  ensureToneEvaluated: (tone: StyleTone) => void;
  isToneEvaluated: (tone: StyleTone) => boolean;
};

const EMPTY_PREVIEW_READINESS: StylePreviewReadiness = Object.freeze({
  hasPreview: false,
  previewUrl: null,
  orientation: null,
  orientationMatches: true,
  source: null,
  completedAt: null,
  isRegenerating: false,
  isOrientationPending: false,
});

type GateCacheRecord = {
  version: string;
  map: Map<string, GateResult>;
};

type EvaluatedToneRecord = {
  version: string;
  tones: Set<StyleTone>;
};

type DefaultGateRecord = {
  version: string;
  gate: GateResult;
};

const buildEntitlementVersion = (
  tier: string,
  status: string,
  remainingTokens: number | null,
  hasPremiumAccess: boolean,
  lastSyncedAt: number | null
) => {
  return [
    tier ?? 'none',
    status ?? 'unknown',
    remainingTokens ?? 'null',
    hasPremiumAccess ? 'premium:1' : 'premium:0',
    lastSyncedAt ?? 'sync:none',
  ].join('|');
};

export const useToneSections = (): ToneSectionsHookResult => {
  const [
    styles,
    selectedStyleId,
    evaluateStyleGate,
    favoriteStyles,
    entitlementsTier,
    entitlementsStatus,
    entitlementsRemainingTokens,
    entitlementsHasPremiumAccess,
    entitlementsLastSyncedAt,
  ] = useFounderStore(
    (state) => [
      state.styles,
      state.selectedStyleId,
      state.evaluateStyleGate,
      state.favoriteStyles,
      state.entitlements.tier,
      state.entitlements.status,
      state.entitlements.remainingTokens,
      state.entitlements.hasPremiumAccess,
      state.entitlements.lastSyncedAt,
    ],
    shallow
  );

  const entitlementVersion = useMemo(
    () =>
      buildEntitlementVersion(
        entitlementsTier,
        entitlementsStatus,
        entitlementsRemainingTokens,
        entitlementsHasPremiumAccess,
        entitlementsLastSyncedAt
      ),
    [
      entitlementsTier,
      entitlementsStatus,
      entitlementsRemainingTokens,
      entitlementsHasPremiumAccess,
      entitlementsLastSyncedAt,
    ]
  );

  const gateCacheRef = useRef<GateCacheRecord>({
    version: entitlementVersion,
    map: new Map(),
  });
  const evaluatedTonesRef = useRef<EvaluatedToneRecord>({
    version: entitlementVersion,
    tones: new Set(),
  });
  const defaultGateRef = useRef<DefaultGateRecord>({
    version: entitlementVersion,
    gate: evaluateStyleGate(null),
  });

  const [cacheVersion, setCacheVersion] = useState(0);

  const previewReadinessMap = usePreviewReadiness();

  const resetCachesForEntitlements = useCallback(() => {
    gateCacheRef.current = {
      version: entitlementVersion,
      map: new Map(),
    };
    evaluatedTonesRef.current = {
      version: entitlementVersion,
      tones: new Set(),
    };
    defaultGateRef.current = {
      version: entitlementVersion,
      gate: evaluateStyleGate(null),
    };
    setCacheVersion((current) => current + 1);
  }, [entitlementVersion, evaluateStyleGate]);

  useEffect(() => {
    if (gateCacheRef.current.version !== entitlementVersion) {
      resetCachesForEntitlements();
    }
  }, [entitlementVersion, resetCachesForEntitlements]);

  const favoriteSet = useMemo(() => {
    return new Set(favoriteStyles.map((id) => id.trim().toLowerCase()).filter(Boolean));
  }, [favoriteStyles]);

  const stylesByTone = useMemo(() => {
    const toneMap: Partial<Record<StyleTone, StyleOption[]>> = {};
    const styleLookup = new Map<string, StyleOption>();

    styles.forEach((style) => {
      if (style.id === 'original-image') {
        return;
      }
      styleLookup.set(style.id, style);
      const metadata = findStyleMetadata(style.id);
      const tone: StyleTone = metadata?.tone ?? 'classic';
      if (!toneMap[tone]) {
        toneMap[tone] = [];
      }
      toneMap[tone]?.push(style);
    });

    const trendingStyles: StyleOption[] = [];
    TRENDING_HERO_STYLES.forEach((heroId) => {
      const style = styleLookup.get(heroId);
      if (style) {
        trendingStyles.push(style);
      } else {
        console.warn('[useToneSections] Missing trending hero style:', heroId);
      }
    });

    if (trendingStyles.length > 0) {
      toneMap.trending = trendingStyles;
    }

    return toneMap;
  }, [styles]);

  const ensureToneEvaluated = useCallback(
    (tone: StyleTone) => {
      if (gateCacheRef.current.version !== entitlementVersion) {
        resetCachesForEntitlements();
      }

      const evaluatedRecord = evaluatedTonesRef.current;

      if (evaluatedRecord.version !== entitlementVersion) {
        resetCachesForEntitlements();
      }

      if (evaluatedRecord.tones.has(tone)) {
        return;
      }

      const toneStyles = stylesByTone[tone];
      if (!toneStyles || toneStyles.length === 0) {
        evaluatedRecord.tones.add(tone);
        return;
      }

      const cacheMap = gateCacheRef.current.map;
      let hasNewGate = false;

      toneStyles.forEach((style) => {
        if (!cacheMap.has(style.id)) {
          cacheMap.set(style.id, evaluateStyleGate(style.id));
          hasNewGate = true;
        }
      });

      evaluatedRecord.tones.add(tone);

      if (hasNewGate) {
        setCacheVersion((current) => current + 1);
      }
    },
    [entitlementVersion, stylesByTone, evaluateStyleGate, resetCachesForEntitlements]
  );

  const isToneEvaluated = useCallback(
    (tone: StyleTone) => {
      if (evaluatedTonesRef.current.version !== entitlementVersion) {
        return false;
      }
      return evaluatedTonesRef.current.tones.has(tone);
    },
    [entitlementVersion]
  );

  useEffect(() => {
    STYLE_TONES_IN_ORDER.forEach((tone) => {
      ensureToneEvaluated(tone);
    });
  }, [ensureToneEvaluated]);

  const sections = useMemo(() => {
    void cacheVersion;
    const normalizedFavoriteSet = favoriteSet;
    const gateCache = gateCacheRef.current.map;
    const evaluatedTones = evaluatedTonesRef.current;
    const defaultGate =
      defaultGateRef.current.version === entitlementVersion
        ? defaultGateRef.current.gate
        : evaluateStyleGate(null);

    return STYLE_TONES_IN_ORDER.map((tone) => {
      const definition = STYLE_TONE_DEFINITIONS[tone];
      const toneStyles = stylesByTone[tone] ?? [];

      const stylesForTone: ToneSectionStyle[] = toneStyles.map((style) => {
        const normalizedId = style.id.trim().toLowerCase();
        const readiness = previewReadinessMap[style.id] ?? EMPTY_PREVIEW_READINESS;
        return {
          option: style,
          metadataTone: tone,
          gate: gateCache.get(style.id) ?? defaultGate,
          isSelected: selectedStyleId === style.id,
          isFavorite: normalizedFavoriteSet.has(normalizedId),
          readiness,
        };
      });

      const toneEvaluated =
        evaluatedTones.version === entitlementVersion
          ? evaluatedTones.tones.has(tone)
          : false;

      const locked =
        toneEvaluated && stylesForTone.length > 0
          ? !stylesForTone.some((entry) => entry.gate.allowed)
          : false;

      const lockedGate =
        toneEvaluated && locked
          ? stylesForTone.find((entry) => !entry.gate.allowed)?.gate
          : undefined;

      return {
        tone,
        definition,
        styles: stylesForTone,
        locked,
        lockedGate,
      };
    });
  }, [
    cacheVersion,
    evaluateStyleGate,
    entitlementVersion,
    favoriteSet,
    previewReadinessMap,
    selectedStyleId,
    stylesByTone,
  ]);

  return {
    sections,
    ensureToneEvaluated,
    isToneEvaluated,
  };
};
