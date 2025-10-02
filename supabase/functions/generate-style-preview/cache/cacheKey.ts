const textEncoder = new TextEncoder();

export const CACHE_KEY_VERSION = 'v1';

export interface CacheKeyParts {
  imageDigest: string;
  styleId: number;
  styleVersion: string;
  aspectRatio: string;
  quality: string;
  watermark: boolean;
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
    watermark
  } = parts;

  const normalizedAspectRatio = aspectRatio.toLowerCase();
  const normalizedQuality = quality.toLowerCase();
  const watermarkFlag = watermark ? 'with-watermark' : 'no-watermark';

  return [
    'preview',
    CACHE_KEY_VERSION,
    styleId,
    styleVersion,
    normalizedAspectRatio,
    normalizedQuality,
    watermarkFlag,
    imageDigest
  ].join(':');
};

export const parseCacheKey = (cacheKey: string): CacheKeyParts | null => {
  const parts = cacheKey.split(':');
  if (parts.length !== 8) {
    return null;
  }

  const [prefix, version, styleId, styleVersion, aspectRatio, quality, watermarkFlag, imageDigest] = parts;

  if (prefix !== 'preview' || version !== CACHE_KEY_VERSION) {
    return null;
  }

  const watermark = watermarkFlag === 'with-watermark';
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
    watermark
  };
};
