import { parseStoragePath, parseStorageUrl } from '../_shared/storageUtils.ts';

export interface GenerationRequest {
  imageUrl: string;
  style: string;
  photoId?: string;
  aspectRatio?: string;
  watermark?: boolean;
  quality?: 'low' | 'medium' | 'high' | 'auto';
  cacheBypass?: boolean;
  fingerprintHash?: string | null;
}

export function validateRequest(body: unknown): { isValid: boolean; error?: string; data?: GenerationRequest } {
  const {
    imageUrl,
    style,
    photoId,
    aspectRatio = '1:1',
    watermark = true,
    quality = 'medium',
    cacheBypass = false,
    fingerprintHash = null
  } = body;

  if (!imageUrl || !style) {
    return {
      isValid: false,
      error: 'Missing required fields: imageUrl and style'
    };
  }

  if (typeof imageUrl !== 'string') {
    return {
      isValid: false,
      error: 'Invalid imageUrl value'
    };
  }

  const trimmedImageUrl = imageUrl.trim();

  if (
    !trimmedImageUrl.startsWith('data:image/') &&
    !parseStorageUrl(trimmedImageUrl) &&
    !parseStoragePath(trimmedImageUrl)
  ) {
    return {
      isValid: false,
      error: 'Unsupported imageUrl. Only data URIs or Wondertone storage paths are allowed.'
    };
  }

  // Map legacy quality values for backward compatibility
  const legacyQualityMap: Record<string, 'low' | 'medium' | 'high' | 'auto'> = {
    'preview': 'medium',
    'final': 'high'
  };
  const normalizedQuality = quality ? (legacyQualityMap[quality] || quality) : 'medium';

  // Validate quality parameter
  const validQualityValues = ['low', 'medium', 'high', 'auto'];
  if (normalizedQuality && !validQualityValues.includes(normalizedQuality)) {
    return {
      isValid: false,
      error: `Invalid quality value. Must be one of: ${validQualityValues.join(', ')}`
    };
  }

  return {
    isValid: true,
    data: { imageUrl, style, photoId, aspectRatio, watermark, quality: normalizedQuality, cacheBypass, fingerprintHash }
  };
}
