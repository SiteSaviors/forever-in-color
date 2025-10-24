import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { shallow } from 'zustand/shallow';
import {
  STYLE_TONE_DEFINITIONS,
  STYLE_TONES_IN_ORDER,
  type StyleTone,
  type StyleToneDefinition,
} from '@/config/styleCatalog';
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

export type ToneSectionsHookResult = {
  sections: ToneSection[];
  ensureToneEvaluated: (tone: StyleTone) => void;
  isToneEvaluated: (tone: StyleTone) => boolean;
};

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
  requiresWatermark: boolean,
  lastSyncedAt: number | null
) => {
  return [
    tier ?? 'none',
    status ?? 'unknown',
    remainingTokens ?? 'null',
    requiresWatermark ? 'wm:1' : 'wm:0',
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
    entitlementsRequiresWatermark,
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
      state.entitlements.requiresWatermark,
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
        entitlementsRequiresWatermark,
        entitlementsLastSyncedAt
      ),
    [
      entitlementsTier,
      entitlementsStatus,
      entitlementsRemainingTokens,
      entitlementsRequiresWatermark,
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

    styles.forEach((style) => {
      if (style.id === 'original-image') {
        return;
      }
      const metadata = findStyleMetadata(style.id);
      const tone: StyleTone = metadata?.tone ?? 'classic';
      if (!toneMap[tone]) {
        toneMap[tone] = [];
      }
      toneMap[tone]?.push(style);
    });

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
        return {
          option: style,
          metadataTone: tone,
          gate: gateCache.get(style.id) ?? defaultGate,
          isSelected: selectedStyleId === style.id,
          isFavorite: normalizedFavoriteSet.has(normalizedId),
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
    selectedStyleId,
    stylesByTone,
  ]);

  return {
    sections,
    ensureToneEvaluated,
    isToneEvaluated,
  };
};
