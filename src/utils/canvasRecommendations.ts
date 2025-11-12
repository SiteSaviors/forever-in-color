import type { CanvasSizeKey, CanvasOrientation } from '@/utils/canvasSizes';

/**
 * Recommendation hints (pure, store-independent)
 * Returns canvas size recommendations based on image dimensions and orientation
 */
export interface RecommendationHint {
  recommendedSize: CanvasSizeKey | null;
  mostPopularSize: CanvasSizeKey;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Get recommended canvas size based on image dimensions + orientation
 * Uses megapixel thresholds to suggest appropriate print sizes
 *
 * @param orientation - Image orientation (vertical, horizontal, square)
 * @param imageWidth - Source image width in pixels (optional)
 * @param imageHeight - Source image height in pixels (optional)
 * @returns Recommended CanvasSizeKey or null if no data available
 */
export function getRecommendedSize(
  orientation: CanvasOrientation,
  imageWidth?: number,
  imageHeight?: number
): CanvasSizeKey | null {
  if (!imageWidth || !imageHeight) return null;

  const pixelCount = imageWidth * imageHeight;
  const megapixels = pixelCount / 1_000_000;

  // High-res images (>4MP) → larger canvases
  if (megapixels > 4) {
    switch (orientation) {
      case 'vertical':
        return 'portrait-24x36'; // Medium (24″ × 36″, $249)
      case 'horizontal':
        return 'landscape-36x24'; // Medium (36″ × 24″, $249)
      case 'square':
        return 'square-32x32'; // Large (32″ × 32″, $349)
    }
  }

  // Medium-res (2-4MP) → mid-tier canvases
  if (megapixels > 2) {
    switch (orientation) {
      case 'vertical':
        return 'portrait-18x24'; // Small (18″ × 24″, $199)
      case 'horizontal':
        return 'landscape-24x18'; // Small (24″ × 18″, $199)
      case 'square':
        return 'square-24x24'; // Medium (24″ × 24″, $219)
    }
  }

  // Lower-res (<2MP) → smaller canvases
  switch (orientation) {
    case 'vertical':
      return 'portrait-12x16'; // Extra Small (12″ × 16″, $149)
    case 'horizontal':
      return 'landscape-16x12'; // Extra Small (16″ × 12″, $149)
    case 'square':
      return 'square-16x16'; // Small (16″ × 16″, $179)
  }
}

/**
 * Fallback: most popular size by orientation
 * Used when no resolution data is available or recommendation is uncertain
 *
 * @param orientation - Image orientation
 * @returns Most popular CanvasSizeKey for that orientation
 */
export function getMostPopularSize(orientation: CanvasOrientation): CanvasSizeKey {
  switch (orientation) {
    case 'vertical':
      return 'portrait-18x24'; // Small (price: $199, sweet spot)
    case 'horizontal':
      return 'landscape-24x18'; // Small (price: $199, sweet spot)
    case 'square':
      return 'square-24x24'; // Medium (price: $219, most popular)
  }
}

/**
 * Main recommendation function
 * Combines resolution-based recommendation with popularity fallback
 *
 * @param orientation - Image orientation
 * @param imageWidth - Source image width (optional)
 * @param imageHeight - Source image height (optional)
 * @returns Complete recommendation hint with confidence level
 */
export function getCanvasRecommendation(
  orientation: CanvasOrientation,
  imageWidth?: number,
  imageHeight?: number
): RecommendationHint {
  const recommended = getRecommendedSize(orientation, imageWidth, imageHeight);
  const mostPopularSize = getMostPopularSize(orientation);

  return {
    recommendedSize: recommended,
    mostPopularSize,
    confidence: recommended ? (imageWidth && imageHeight ? 'high' : 'low') : 'low',
  };
}
