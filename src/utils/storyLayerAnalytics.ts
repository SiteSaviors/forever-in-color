import type { StyleTone } from '@/config/styleCatalog';
import type { EntitlementTier } from '@/store/founder/storeTypes';
import { emitStepOneEvent } from '@/utils/telemetry';

const log = (payload: unknown) => {
  console.log('[StoryLayerAnalytics]', payload);
};

type BasePayload = {
  styleId: string;
  tone: StyleTone | null;
  userTier: EntitlementTier;
  orientation: string;
};

type StoryImpressionPayload = BasePayload & { timestamp: number };

type PaletteHoverPayload = BasePayload & {
  swatchId: string;
};

type ComplementaryClickPayload = BasePayload & {
  targetStyleId: string;
  allowed: boolean;
  isFallback: boolean;
  requiredTier?: string | null;
};

type ShareClickPayload = BasePayload & {
  action: 'caption' | 'download' | 'social';
  channel?: 'facebook' | 'instagram' | 'pinterest' | 'twitter';
};

type StoryCtaPayload = BasePayload & {
  cta: 'unlock_studio' | 'create_canvas';
};

export const trackStoryImpression = (payload: StoryImpressionPayload) => {
  log({ event: 'storyLayer.impression', ...payload });
};

export const trackPaletteHover = (payload: PaletteHoverPayload) => {
  log({ event: 'storyLayer.palette_hover', ...payload });
};

export const trackComplementaryClick = (payload: ComplementaryClickPayload) => {
  log({ event: 'storyLayer.complementary_click', ...payload });
  if (!payload.allowed && payload.requiredTier) {
    emitStepOneEvent({
      type: 'tone_style_locked',
      styleId: payload.targetStyleId,
      requiredTier: payload.requiredTier,
    });
  }
};

export const trackShareClick = (payload: ShareClickPayload) => {
  log({ event: 'storyLayer.share_click', ...payload });
};

export const trackStoryCtaClick = (payload: StoryCtaPayload) => {
  log({ event: 'storyLayer.cta_click', ...payload });
};
