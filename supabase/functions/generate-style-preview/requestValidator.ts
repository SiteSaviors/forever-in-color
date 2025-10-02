export interface GenerationRequest {
  imageUrl: string;
  style: string;
  photoId?: string;
  aspectRatio?: string;
  watermark?: boolean;
  quality?: 'low' | 'medium' | 'high' | 'auto';
  cacheBypass?: boolean;
}

export function validateRequest(body: any): { isValid: boolean; error?: string; data?: GenerationRequest } {
  const {
    imageUrl,
    style,
    photoId,
    aspectRatio = '1:1',
    watermark = true,
    quality = 'medium',
    cacheBypass = false
  } = body;

  if (!imageUrl || !style) {
    return {
      isValid: false,
      error: 'Missing required fields: imageUrl and style'
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
    data: { imageUrl, style, photoId, aspectRatio, watermark, quality: normalizedQuality, cacheBypass }
  };
}
