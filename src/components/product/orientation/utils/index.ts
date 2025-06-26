
// Consolidated orientation utilities
export { getOrientationIcon } from './orientationIcons';
export { getCanvasPreview } from './canvasPreview';
export { detectOrientationFromImage, convertOrientationToAspectRatio } from '../../utils/orientationDetection';

// Aspect ratio utility (moved from contexts)
export const getAspectRatio = (orientation: string): string => {
  switch (orientation) {
    case 'vertical':
      return '2:3';
    case 'horizontal':
      return '3:2';
    case 'square':
    default:
      return '1:1';
  }
};

// Re-export commonly used orientation data
export { orientationOptions } from '../data/orientationOptions';
export { sizeOptions } from '../data/sizeOptions';
