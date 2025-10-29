import { useCallback } from 'react';
import { useFounderStore } from '@/store/useFounderStore';
import type { GalleryQuickviewItem } from '@/store/founder/storeTypes';
import { emitStepOneEvent } from '@/utils/telemetry';
import { trackGalleryQuickviewThumbnailClick } from '@/utils/galleryQuickviewTelemetry';
import { getImageDimensions } from '@/utils/imageUtils';

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
        reject(new Error('Failed to read image data'));
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read image data'));
    reader.readAsDataURL(blob);
  });
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

      let baseImageUrl = item.sourceDisplayUrl ?? null;
      if (!baseImageUrl && item.sourceStoragePath) {
        const ref = item.sourceStoragePath;
        const { VITE_SUPABASE_URL } = import.meta.env;
        baseImageUrl = VITE_SUPABASE_URL
          ? `${VITE_SUPABASE_URL}/storage/v1/object/public/${ref}`
          : item.imageUrl;
      }
      if (!baseImageUrl) {
        baseImageUrl = item.imageUrl;
      }

      let baseImageDataUrl: string | null = null;
      try {
        baseImageDataUrl = await fetchImageAsDataUrl(baseImageUrl);
      } catch (error) {
        console.error('[useGalleryQuickviewSelection] Failed to hydrate original image', error);
        baseImageDataUrl = previewUrl;
      }

      let dimensions = { width: 0, height: 0 };
      try {
        dimensions = await getImageDimensions(baseImageDataUrl);
      } catch (error) {
        console.error('[useGalleryQuickviewSelection] Failed to resolve image dimensions', error);
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
