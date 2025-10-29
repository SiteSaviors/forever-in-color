import { useCallback } from 'react';
import { useFounderStore } from '@/store/useFounderStore';
import type { GalleryQuickviewItem } from '@/store/founder/storeTypes';
import { emitStepOneEvent } from '@/utils/telemetry';
import { trackGalleryQuickviewThumbnailClick } from '@/utils/galleryQuickviewTelemetry';
import { buildPublicStorageUrl } from '@/utils/storagePaths';

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

const SIGNED_URL_BUFFER_MS = 5_000;

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

const fetchImageAsDataUrl = async (url: string): Promise<string> => {
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }
  const blob = await response.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert image to data URL'));
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error('Failed to convert image to data URL'));
    reader.readAsDataURL(blob);
  });
};

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

export const useGalleryQuickviewSelection = () => {
  return useCallback(
    async (item: GalleryQuickviewItem, requiresWatermark: boolean | null, position: number) => {
      const store = useFounderStore.getState();

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
      let baseImageUrl = previewUrl;
      let dimensions = { width: 0, height: 0 };

      for (const candidate of candidates) {
        try {
          dimensions = await preloadImage(candidate);
          baseImageUrl = candidate;
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
          baseImageUrl = previewUrl;
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

      let baseImageDataUrl = baseImageUrl;
      try {
        baseImageDataUrl = await fetchImageAsDataUrl(baseImageUrl);
      } catch (error) {
        console.error('[useGalleryQuickviewSelection] Failed to convert base image to data URL', error);
      }

      const smartCropResult = {
        orientation: targetOrientation,
        dataUrl: baseImageDataUrl,
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
      store.setOriginalImage(baseImageDataUrl);
      store.setOriginalImageDimensions({
        width: smartCropResult.imageDimensions.width,
        height: smartCropResult.imageDimensions.height,
      });

      const signedValid = isSignedUrlValid(item);
      store.setOriginalImageSource({
        storagePath: item.sourceStoragePath ?? null,
        publicUrl: item.sourceDisplayUrl ?? null,
        signedUrl: signedValid ? item.sourceSignedUrl ?? null : null,
        signedUrlExpiresAt: signedValid ? item.sourceSignedUrlExpiresAt ?? null : null,
        hash: null,
        bytes: null,
      });

      store.setCroppedImage(baseImageDataUrl);
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
    },
    []
  );
};
