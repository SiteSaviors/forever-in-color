import { buildPublicStorageUrl } from '@/utils/storagePaths';
import { trackGalleryQuickviewDataUriUsage } from '@/utils/galleryQuickviewTelemetry';
import type { GalleryQuickviewItem } from '@/store/founder/storeTypes';
import type { Orientation } from '@/utils/imageUtils';
import type { FounderState } from '@/store/founder/storeTypes';
import type { SmartCropResult } from '@/utils/smartCrop';
import { fetchGallerySource } from '@/utils/galleryApi';

const SIGNED_URL_BUFFER_MS = 5_000;
const SOURCE_CACHE_TTL_MS = 5 * 60 * 1000;

const gallerySourceCache = new Map<string, { dataUri: string; expiresAt: number }>();

const getCachedSourceDataUri = (storagePath: string | null | undefined): string | null => {
  if (!storagePath) return null;
  const entry = gallerySourceCache.get(storagePath);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    gallerySourceCache.delete(storagePath);
    return null;
  }
  return entry.dataUri;
};

const cacheSourceDataUri = (storagePath: string, dataUri: string) => {
  gallerySourceCache.set(storagePath, {
    dataUri,
    expiresAt: Date.now() + SOURCE_CACHE_TTL_MS,
  });
};

const dataUriPrefix = 'data:';

export const isSourceSignedUrlValid = (item: GalleryQuickviewItem): boolean => {
  if (!item.sourceSignedUrl || !item.sourceSignedUrlExpiresAt) {
    return false;
  }
  return item.sourceSignedUrlExpiresAt > Date.now() + SIGNED_URL_BUFFER_MS;
};

const dedupeCandidates = (candidates: Array<string | null | undefined>): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of candidates) {
    if (!value) continue;
    if (seen.has(value)) continue;
    seen.add(value);
    result.push(value);
  }
  return result;
};

export const resolveDisplayImage = (item: GalleryQuickviewItem): string => {
  const signedUrl = isSourceSignedUrlValid(item) ? item.sourceSignedUrl : null;
  const candidates = dedupeCandidates([
    item.displayUrl,
    item.imageUrl,
    item.sourceDisplayUrl,
    signedUrl,
    buildPublicStorageUrl(item.storagePath ?? null),
    buildPublicStorageUrl(item.sourceStoragePath ?? null),
  ]);
  return candidates[0] ?? '';
};

const convertToDataUri = async (url: string): Promise<string> => {
  if (url.startsWith(dataUriPrefix)) {
    return url;
  }
  const response = await fetch(url, { mode: 'cors' });
  if (!response.ok) {
    throw new Error('Unable to fetch image for data URI conversion');
  }
  const blob = await response.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error('Failed to convert image to data URI'));
    reader.readAsDataURL(blob);
  });
};

type SourceResolution = {
  source: string;
  usedDataUri: boolean;
  fallbackReason?: 'missing_source' | 'expired_signed_url' | 'invalid_dimensions';
};

type ResolveSourceImageOptions = {
  accessToken?: string | null;
};

const toDataUriWithTelemetry = async (
  url: string,
  item: GalleryQuickviewItem
): Promise<{ value: string; usedDataUri: boolean }> => {
  if (!url) {
    return { value: '', usedDataUri: false };
  }
  if (url.startsWith(dataUriPrefix)) {
    return { value: url, usedDataUri: true };
  }
  const dataUri = await convertToDataUri(url);
  trackGalleryQuickviewDataUriUsage({ artId: item.id, styleId: item.styleId });
  return { value: dataUri, usedDataUri: true };
};

const resolveStoredSourceImage = async (
  item: GalleryQuickviewItem,
  options?: ResolveSourceImageOptions
): Promise<SourceResolution | null> => {
  const storagePath = item.sourceStoragePath ?? null;
  if (!storagePath) {
    return null;
  }

  const cached = getCachedSourceDataUri(storagePath);
  if (cached) {
    return { source: cached, usedDataUri: true };
  }

  const accessToken = options?.accessToken ?? null;
  if (!accessToken) {
    console.warn('[GalleryQuickview] Missing access token for gallery source retrieval');
    return null;
  }

  try {
    const response = await fetchGallerySource({
      previewLogId: item.previewLogId ?? null,
      sourceStoragePath: storagePath,
      accessToken,
    });
    if (response?.signedUrl) {
      const { value } = await toDataUriWithTelemetry(response.signedUrl, item);
      cacheSourceDataUri(storagePath, value);
      return { source: value, usedDataUri: true };
    }
  } catch (error) {
    console.error('[GalleryQuickview] Failed to retrieve gallery source', error);
  }

  return null;
};

export const resolveSourceImage = async (
  item: GalleryQuickviewItem,
  displayImageUrl: string,
  options?: ResolveSourceImageOptions
): Promise<SourceResolution> => {
  const storedSource = await resolveStoredSourceImage(item, options);
  if (storedSource) {
    return storedSource;
  }

  const signedValid = isSourceSignedUrlValid(item);
  if (item.sourceSignedUrl && signedValid) {
    try {
      const { value } = await toDataUriWithTelemetry(item.sourceSignedUrl, item);
      return { source: value, usedDataUri: true };
    } catch (error) {
      console.warn('[GalleryQuickview] Failed to convert signed URL to data URI', error);
    }
  }

  let fallbackReason: 'missing_source' | 'expired_signed_url' | undefined;
  if (item.sourceSignedUrl && !signedValid) {
    fallbackReason = 'expired_signed_url';
  }
  if (!item.sourceStoragePath && !item.sourceSignedUrl) {
    fallbackReason = 'missing_source';
  }

  const fallbackCandidates = dedupeCandidates([
    item.sourceSignedUrl,
    item.sourceDisplayUrl,
    item.imageUrl,
    item.displayUrl,
    displayImageUrl,
  ]);

  for (const candidate of fallbackCandidates) {
    if (!candidate) continue;
    try {
      const { value, usedDataUri } = await toDataUriWithTelemetry(candidate, item);
      return { source: value, usedDataUri, fallbackReason };
    } catch (error) {
      console.warn('[GalleryQuickview] Failed to convert fallback source to data URI', {
        candidate,
        error,
      });
    }
  }

  return {
    source: displayImageUrl,
    usedDataUri: displayImageUrl.startsWith(dataUriPrefix),
    fallbackReason,
  };
};

export const buildSmartCropResult = (
  orientation: Orientation,
  displayImageUrl: string,
  region: { x: number; y: number; width: number; height: number },
  dimensions: { width: number; height: number }
): SmartCropResult => ({
  orientation,
  dataUrl: displayImageUrl,
  region,
  imageDimensions: { width: dimensions.width, height: dimensions.height },
  generatedAt: Date.now(),
  generatedBy: 'manual',
});

export const hydratePreviewState = (
  store: FounderState,
  payload: {
    orientation: Orientation;
    smartCropResult: SmartCropResult;
    displayImageUrl: string;
    sourceImageUrl: string;
    requiresWatermark: boolean;
    item: GalleryQuickviewItem;
  }
) => {
  const { orientation, smartCropResult, displayImageUrl, sourceImageUrl, requiresWatermark, item } = payload;
  if (store.orientation !== orientation) {
    store.setOrientation(orientation);
  }
  store.setSmartCropForOrientation(orientation, smartCropResult);
  store.setOriginalImage(sourceImageUrl);
  store.setOriginalImageDimensions({
    width: smartCropResult.imageDimensions.width,
    height: smartCropResult.imageDimensions.height,
  });
  const signedValid = isSourceSignedUrlValid(item);
  store.setOriginalImageSource({
    storagePath: item.sourceStoragePath ?? null,
    publicUrl: item.sourceDisplayUrl ?? null,
    signedUrl: signedValid ? item.sourceSignedUrl ?? null : null,
    signedUrlExpiresAt: signedValid ? item.sourceSignedUrlExpiresAt ?? null : null,
    hash: null,
    bytes: null,
  });
  store.setCroppedImage(sourceImageUrl);
  store.setOrientationPreviewPending(false);
  store.markCropReady();
  store.setLaunchpadSlimMode(true);

  store.selectStyle(item.styleId);
  store.setPendingStyle(null);
  store.setStylePreviewState('idle', null, null);
  store.setPreviewStatus('ready');

  const previewResult = {
    previewUrl: displayImageUrl,
    watermarkApplied: requiresWatermark,
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
    url: displayImageUrl,
    orientation,
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
    orientation,
  });
};
