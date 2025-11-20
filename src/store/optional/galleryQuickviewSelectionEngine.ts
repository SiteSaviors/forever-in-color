import { emitStepOneEvent } from '@/utils/telemetry';
import {
  trackGalleryQuickviewThumbnailClick,
  trackGalleryQuickviewSourceFallback,
} from '@/utils/galleryQuickviewTelemetry';
import { buildPublicStorageUrl } from '@/utils/storagePaths';
import type { GalleryQuickviewItem } from '@/store/founder/storeTypes';
import type { FounderState } from '@/store/founder/storeTypes';
import {
  resolveDisplayImage,
  resolveSourceImage,
  buildSmartCropResult,
  hydratePreviewState,
  isSourceSignedUrlValid,
} from '@/store/optional/galleryQuickviewHelpers';

const isGalleryDebugEnabled = import.meta.env.DEV;

const orientationMap = {
  square: 'square' as const,
  horizontal: 'horizontal' as const,
  vertical: 'vertical' as const,
};

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const readOptionalNumber = (config: Record<string, unknown>, key: string, fallback: number): number =>
  toNumber(config[key], fallback);

const preloadImage = async (url: string): Promise<{ width: number; height: number }> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;
      if (!width || !height) {
        reject(new Error('Image has invalid dimensions'));
        return;
      }
      resolve({ width, height });
    };
    img.onerror = (event) => {
      reject(event instanceof ErrorEvent ? event.error : new Error('Failed to load image'));
    };
    img.src = url;
  });

const dedupe = (values: Array<string | null | undefined>): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    if (!value) continue;
    if (seen.has(value)) continue;
    seen.add(value);
    result.push(value);
  }
  return result;
};

const buildDimensionCandidates = (
  item: GalleryQuickviewItem,
  displayImageUrl: string
): string[] => {
  const signedUrl = isSourceSignedUrlValid(item) ? item.sourceSignedUrl : null;
  return dedupe([
    signedUrl,
    item.sourceDisplayUrl,
    buildPublicStorageUrl(item.sourceStoragePath ?? null),
    item.displayUrl,
    item.imageUrl,
    buildPublicStorageUrl(item.storagePath ?? null),
    displayImageUrl,
  ]);
};

export const handleGalleryQuickviewSelection = async (
  store: FounderState,
  item: GalleryQuickviewItem,
  requiresWatermark: boolean | null,
  position: number
) => {
  trackGalleryQuickviewThumbnailClick({
    artId: item.id,
    styleId: item.styleId,
    savedAt: item.savedAt,
    position,
  });

  await store.ensureStyleLoaded(item.styleId);

  const targetOrientation = orientationMap[item.orientation] ?? 'square';
  const displayImageUrl = resolveDisplayImage(item);
  const requiresWatermarkFlag = requiresWatermark ?? true;
  const accessToken = typeof store.getSessionAccessToken === 'function' ? store.getSessionAccessToken() : null;

  const candidates = buildDimensionCandidates(item, displayImageUrl);
  let dimensions = { width: 0, height: 0 };

  for (const candidate of candidates) {
    try {
      dimensions = await preloadImage(candidate);
      break;
    } catch (error) {
      console.warn('[useGalleryQuickviewSelection] Failed to preload candidate image', {
        candidate,
        error,
      });
    }
  }

  if (!dimensions.width || !dimensions.height) {
    try {
      dimensions = await preloadImage(displayImageUrl);
    } catch (error) {
      console.error('[useGalleryQuickviewSelection] Failed to preload fallback preview image', error);
      trackGalleryQuickviewSourceFallback({
        artId: item.id,
        styleId: item.styleId,
        reason: 'invalid_dimensions',
      });
    }
  }

  const cropConfig = (item.cropConfig ?? {}) as Record<string, unknown>;
  const region = {
    x: toNumber(cropConfig.x),
    y: toNumber(cropConfig.y),
    width: toNumber(cropConfig.width, dimensions.width),
    height: toNumber(cropConfig.height, dimensions.height),
  };

  if (!dimensions.width || !dimensions.height) {
    dimensions = {
      width: region.width || 0,
      height: region.height || 0,
    };
  }

  const smartCropResult = buildSmartCropResult(targetOrientation, displayImageUrl, region, {
    width: readOptionalNumber(cropConfig, 'imageWidth', dimensions.width),
    height: readOptionalNumber(cropConfig, 'imageHeight', dimensions.height),
  });

  const sourceResolution = await resolveSourceImage(item, displayImageUrl, {
    accessToken,
  });
  if (isGalleryDebugEnabled) {
    const expiresInMs = item.sourceSignedUrlExpiresAt ? item.sourceSignedUrlExpiresAt - Date.now() : null;
    console.info('[GalleryRecall]', {
      artId: item.id,
      styleId: item.styleId,
      position,
      sourceStoragePath: item.sourceStoragePath ?? null,
      hasSignedUrl: Boolean(item.sourceSignedUrl),
      signedUrlExpiresInMs: expiresInMs,
      usedDataUri: sourceResolution.usedDataUri,
      fallbackReason: sourceResolution.fallbackReason ?? null,
    });
  }
  if (sourceResolution.fallbackReason) {
    trackGalleryQuickviewSourceFallback({
      artId: item.id,
      styleId: item.styleId,
      reason: sourceResolution.fallbackReason,
    });
  }

  hydratePreviewState(store, {
    orientation: targetOrientation,
    smartCropResult,
    displayImageUrl,
    sourceImageUrl: sourceResolution.source,
    requiresWatermark: requiresWatermarkFlag,
    item,
  });

  emitStepOneEvent({ type: 'preview', styleId: item.styleId, status: 'complete' });
};
