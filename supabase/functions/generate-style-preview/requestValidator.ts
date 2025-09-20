export interface GenerationRequest {
  imageUrl: string;
  style: string;
  photoId?: string;
  aspectRatio?: string;
  watermark?: boolean;
  quality?: string;
}

export function validateRequest(body: any): { isValid: boolean; error?: string; data?: GenerationRequest } {
  const { imageUrl, style, photoId, aspectRatio = '1:1', watermark = true, quality = 'preview' } = body;

  if (!imageUrl || !style) {
    return {
      isValid: false,
      error: 'Missing required fields: imageUrl and style'
    };
  }

  return {
    isValid: true,
    data: { imageUrl, style, photoId, aspectRatio, watermark, quality }
  };
}