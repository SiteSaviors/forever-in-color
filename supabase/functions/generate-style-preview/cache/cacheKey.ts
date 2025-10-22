const textEncoder = new TextEncoder();

export const CACHE_KEY_VERSION = 'v4'; // Incremented: include entitlement tier dimension

export interface CacheKeyParts {
  imageDigest: string;
  styleId: number;
  styleVersion: string;
  aspectRatio: string;
  quality: string;
  watermark?: boolean; // Optional for backwards compat, ignored in v3
  tier?: string | null;
}

const base64Url = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

export const createImageDigest = async (imageData: string): Promise<string> => {
  const normalized = imageData.trim();
  const buffer = textEncoder.encode(normalized);
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return base64Url(digest);
};

export const buildCacheKey = (parts: CacheKeyParts): string => {
  const {
    imageDigest,
    styleId,
    styleVersion,
    aspectRatio,
    quality,
    tier
    // watermark param removed - single clean cache entry per image
  } = parts;

  const normalizedAspectRatio = aspectRatio.toLowerCase();
  const normalizedQuality = quality.toLowerCase();
  const normalizedTier = (tier ?? 'shared').toString().toLowerCase();

  return [
    'preview',
    CACHE_KEY_VERSION,
    styleId,
    styleVersion,
    normalizedAspectRatio,
    normalizedQuality,
    normalizedTier,
    imageDigest
  ].join(':');
};

/**
 * Optional metadata for creating image digests with immutability hints.
 * Used for mutable storage URLs (e.g., Supabase Storage) to prevent stale cache hits.
 */
export interface ImageDigestMetadata {
  etag?: string;
  lastModified?: string;
}

/**
 * Enhanced version of createImageDigest that includes metadata for mutable URLs.
 * For future use when supporting Supabase Storage or other mutable URL sources.
 *
 * @param imageInput - The image URL or data URI
 * @param metadata - Optional immutability hints (ETag, Last-Modified)
 * @returns SHA-256 digest of the input + metadata
 */
export const createImageDigestWithMetadata = async (
  imageInput: string,
  metadata?: ImageDigestMetadata
): Promise<string> => {
  const baseInput = imageInput.trim();
  const metaSuffix = metadata?.etag
    ? `|etag:${metadata.etag}`
    : metadata?.lastModified
      ? `|modified:${metadata.lastModified}`
      : '';

  const digestInput = baseInput + metaSuffix;
  const buffer = textEncoder.encode(digestInput);
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return base64Url(digest);
};

export const parseCacheKey = (cacheKey: string): CacheKeyParts | null => {
  const parts = cacheKey.split(':');

  // Support both v3 (7 parts, no watermark) and v2 (8 parts, with watermark) for migration
  if (parts.length === 8 && parts[1] === CACHE_KEY_VERSION) {
    // v4 format: preview:v4:styleId:styleVersion:aspectRatio:quality:tier:imageDigest
    const [prefix, version, styleId, styleVersion, aspectRatio, quality, tier, imageDigest] = parts;

    if (prefix !== 'preview' || version !== CACHE_KEY_VERSION) {
      return null;
    }

    const parsedStyleId = Number.parseInt(styleId, 10);
    if (Number.isNaN(parsedStyleId)) {
      return null;
    }

    return {
      imageDigest,
      styleId: parsedStyleId,
      styleVersion,
      aspectRatio,
      quality,
      tier
    };
  } else if (parts.length === 7) {
    // v3 format: preview:v3:styleId:styleVersion:aspectRatio:quality:imageDigest
    const [prefix, version, styleId, styleVersion, aspectRatio, quality, imageDigest] = parts;

    if (prefix !== 'preview' || version !== 'v3') {
      return null;
    }

    const parsedStyleId = Number.parseInt(styleId, 10);
    if (Number.isNaN(parsedStyleId)) {
      return null;
    }

    return {
      imageDigest,
      styleId: parsedStyleId,
      styleVersion,
      aspectRatio,
      quality
    };
  } else if (parts.length === 8 && parts[1] === 'v2') {
    // v2 format (legacy): preview:v2:styleId:styleVersion:aspectRatio:quality:watermarkFlag:imageDigest
    const [prefix, version, styleId, styleVersion, aspectRatio, quality, _watermarkFlag, imageDigest] = parts;

    if (prefix !== 'preview' || version !== 'v2') {
      return null;
    }

    const parsedStyleId = Number.parseInt(styleId, 10);
    if (Number.isNaN(parsedStyleId)) {
      return null;
    }

    return {
      imageDigest,
      styleId: parsedStyleId,
      styleVersion,
      aspectRatio,
      quality
      // watermark param ignored for v2 compatibility
    };
  }

  return null;
};
