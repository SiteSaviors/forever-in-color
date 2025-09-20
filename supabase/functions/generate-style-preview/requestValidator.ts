export interface GenerationRequest {
  imageUrl: string;
  style: string;
  photoId?: string;
  aspectRatio?: string;
  watermark?: boolean;
  quality?: 'low' | 'medium' | 'high' | 'auto';
}

export function validateRequest(body: any): { isValid: boolean; error?: string; data?: GenerationRequest } {
  const { imageUrl, style, photoId, aspectRatio = '1:1', watermark = true, quality = 'medium' } = body;

  if (!imageUrl || !style) {
    return {
      isValid: false,
      error: 'Missing required fields: imageUrl and style'
    };
  }

  // Validate quality parameter
  const validQualityValues = ['low', 'medium', 'high', 'auto'];
  if (quality && !validQualityValues.includes(quality)) {
    return {
      isValid: false,
      error: `Invalid quality value. Must be one of: ${validQualityValues.join(', ')}`
    };
  }

  return {
    isValid: true,
    data: { imageUrl, style, photoId, aspectRatio, watermark, quality }
  };
}