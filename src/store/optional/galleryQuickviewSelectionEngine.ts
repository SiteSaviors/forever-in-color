import { emitStepOneEvent } from '@/utils/telemetry';
import { trackGalleryQuickviewThumbnailClick } from '@/utils/galleryQuickviewTelemetry';
import { buildPublicStorageUrl } from '@/utils/storagePaths';
import type { GalleryQuickviewItem } from '@/store/founder/storeTypes';
import type { FounderState } from '@/store/founder/storeTypes';

const orientationMap = {
  square: 'square' as const,
  horizontal: 'horizontal' as const,
  vertical: 'vertical' as const,
};

const SIGNED_URL_BUFFER_MS = 5_000;

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const readOptionalNumber = (config: Record<string, unknown>, key: string, fallback: number): number =>
  toNumber(config[key], fallback);

const isSignedUrlValid = (item: GalleryQuickviewItem): boolean => {
  if (!item.sourceSignedUrl || !item.sourceSignedUrlExpiresAt) return false;
  return item.sourceSignedUrlExpiresAt > Date.now() + SIGNED_URL_BUFFER_MS;
};

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

const selectBestSourceUrl = (item: GalleryQuickviewItem): string[] => {
  const candidates: string[] = [];
  if (isSignedUrlValid(item) && item.sourceSignedUrl) {
    candidates.push(item.sourceSignedUrl);
  }
  if (item.sourceDisplayUrl) {
    candidates.push(item.sourceDisplayUrl);
  }
  const publicSource = buildPublicStorageUrl(item.sourceStoragePath ?? null);
  if (publicSource) {
    candidates.push(publicSource);
  }
  candidates.push(item.displayUrl ?? item.imageUrl);
  return candidates;
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
  const previewUrl = item.displayUrl ?? item.imageUrl;
  const requiresWatermarkFlag = requiresWatermark ?? true;

  const candidates = selectBestSourceUrl(item);
  let resolvedOriginalImageUrl: string | null = null;
  let dimensions = { width: 0, height: 0 };

  for (const candidate of candidates) {
    try {
      dimensions = await preloadImage(candidate);
      if (!resolvedOriginalImageUrl) {
        resolvedOriginalImageUrl = candidate;
      }
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
      dimensions = await preloadImage(previewUrl);
      if (!resolvedOriginalImageUrl) {
        resolvedOriginalImageUrl = previewUrl;
      }
    } catch (error) {
      console.error('[useGalleryQuickviewSelection] Failed to preload fallback preview image', error);
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

  const sourceForGeneration = item.sourceStoragePath || item.sourceSignedUrl || previewUrl;

  const smartCropResult = {
    orientation: targetOrientation,
    dataUrl: previewUrl,
    region,
    imageDimensions: {
      width: readOptionalNumber(cropConfig, 'imageWidth', dimensions.width),
      height: readOptionalNumber(cropConfig, 'imageHeight', dimensions.height),
    },
    generatedAt: Date.now(),
    generatedBy: 'manual' as const,
  };

  if (store.orientation !== targetOrientation) {
    store.setOrientation(targetOrientation);
  }

  store.setSmartCropForOrientation(targetOrientation, smartCropResult);
  const signedValid = isSignedUrlValid(item);
  if (!resolvedOriginalImageUrl) {
    resolvedOriginalImageUrl =
      item.sourceDisplayUrl ??
      (signedValid ? item.sourceSignedUrl ?? null : null) ??
      previewUrl;
  }

  store.setOriginalImage(resolvedOriginalImageUrl);
  store.setOriginalImageDimensions({
    width: smartCropResult.imageDimensions.width,
    height: smartCropResult.imageDimensions.height,
  });
  store.setOriginalImageSource({
    storagePath: item.sourceStoragePath ?? null,
    publicUrl: item.sourceDisplayUrl ?? null,
    signedUrl: signedValid ? item.sourceSignedUrl ?? null : null,
    signedUrlExpiresAt: signedValid ? item.sourceSignedUrlExpiresAt ?? null : null,
    hash: null,
    bytes: null,
  });

  store.setCroppedImage(sourceForGeneration);
  store.setOrientationPreviewPending(false);
  store.markCropReady();
  store.setLaunchpadSlimMode(true);

  store.selectStyle(item.styleId);
  store.setPendingStyle(null);
  store.setStylePreviewState('idle', null, null);
  store.setPreviewStatus('ready');

  const previewResult = {
    previewUrl,
    watermarkApplied: requiresWatermarkFlag,
    startedAt: Date.now(),
    completedAt: Date.now(),
    storageUrl: item.displayUrl ?? item.imageUrl,
    storagePath: item.storagePath,
    sourceStoragePath: item.sourceStoragePath ?? null,
    sourceDisplayUrl: item.sourceDisplayUrl ?? null,
    previewLogId: item.previewLogId ?? null,
    cropConfig: item.cropConfig ?? null,
    softRemaining: null,
  };

  store.cacheStylePreview(item.styleId, {
    url: previewUrl,
    orientation: targetOrientation,
    generatedAt: Date.now(),
    storageUrl: previewResult.storageUrl,
    storagePath: previewResult.storagePath,
    sourceStoragePath: previewResult.sourceStoragePath,
    sourceDisplayUrl: previewResult.sourceDisplayUrl,
    previewLogId: previewResult.previewLogId ?? null,
    cropConfig: previewResult.cropConfig,
  });

  store.setPreviewState(item.styleId, {
    status: 'ready',
    data: previewResult,
    orientation: targetOrientation,
  });

  emitStepOneEvent({ type: 'preview', styleId: item.styleId, status: 'complete' });
};
