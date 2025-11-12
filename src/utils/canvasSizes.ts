import type { Orientation } from '@/utils/imageUtils';

export type CanvasOrientation = Orientation; // alias for clarity

export type CanvasSizeKey =
  | 'landscape-16x12'
  | 'landscape-24x18'
  | 'landscape-36x24'
  | 'landscape-40x30'
  | 'landscape-48x32'
  | 'landscape-60x40'
  | 'portrait-12x16'
  | 'portrait-18x24'
  | 'portrait-24x36'
  | 'portrait-30x40'
  | 'portrait-32x48'
  | 'portrait-40x60'
  | 'square-16x16'
  | 'square-24x24'
  | 'square-32x32'
  | 'square-36x36';

export type CanvasSizeOption = {
  id: CanvasSizeKey;
  orientation: CanvasOrientation;
  label: string;
  nickname?: string;
  price: number;
};

export const CANVAS_SIZE_OPTIONS: Record<CanvasOrientation, CanvasSizeOption[]> = {
  horizontal: [
    { id: 'landscape-16x12', orientation: 'horizontal', label: '16″ × 12″', nickname: 'Extra Small', price: 149 },
    { id: 'landscape-24x18', orientation: 'horizontal', label: '24″ × 18″', nickname: 'Small', price: 199 },
    { id: 'landscape-36x24', orientation: 'horizontal', label: '36″ × 24″', nickname: 'Medium', price: 249 },
    { id: 'landscape-40x30', orientation: 'horizontal', label: '40″ × 30″', nickname: 'Large', price: 319 },
    { id: 'landscape-48x32', orientation: 'horizontal', label: '48″ × 32″', nickname: 'Extra Large', price: 449 },
    { id: 'landscape-60x40', orientation: 'horizontal', label: '60″ × 40″', nickname: 'XXL', price: 599 },
  ],
  vertical: [
    { id: 'portrait-12x16', orientation: 'vertical', label: '12″ × 16″', nickname: 'Extra Small', price: 149 },
    { id: 'portrait-18x24', orientation: 'vertical', label: '18″ × 24″', nickname: 'Small', price: 199 },
    { id: 'portrait-24x36', orientation: 'vertical', label: '24″ × 36″', nickname: 'Medium', price: 249 },
    { id: 'portrait-30x40', orientation: 'vertical', label: '30″ × 40″', nickname: 'Large', price: 319 },
    { id: 'portrait-32x48', orientation: 'vertical', label: '32″ × 48″', nickname: 'Extra Large', price: 449 },
    { id: 'portrait-40x60', orientation: 'vertical', label: '40″ × 60″', nickname: 'XXL', price: 599 },
  ],
  square: [
    { id: 'square-16x16', orientation: 'square', label: '16″ × 16″', nickname: 'Small', price: 179 },
    { id: 'square-24x24', orientation: 'square', label: '24″ × 24″', nickname: 'Medium', price: 219 },
    { id: 'square-32x32', orientation: 'square', label: '32″ × 32″', nickname: 'Large', price: 349 },
    { id: 'square-36x36', orientation: 'square', label: '36″ × 36″', nickname: 'Extra Large', price: 499 },
  ],
};

export const getCanvasSizeOption = (id: CanvasSizeKey | null | undefined): CanvasSizeOption | undefined => {
  if (!id) return undefined;
  for (const options of Object.values(CANVAS_SIZE_OPTIONS)) {
    const match = options.find((option) => option.id === id);
    if (match) {
      return match;
    }
  }
  return undefined;
};

export const getDefaultSizeForOrientation = (orientation: CanvasOrientation): CanvasSizeKey => {
  const options = CANVAS_SIZE_OPTIONS[orientation];
  // Choose the second tier (index 1) as default to anchor on popular price point; fallback to first.
  return options[1]?.id ?? options[0].id;
};

/**
 * Context copy for each canvas size
 * Provides room-placement guidance to help users visualize where each size works best
 */
export const CANVAS_SIZE_CONTEXT_COPY: Record<CanvasSizeKey, string> = {
  // Portrait
  'portrait-12x16': 'Perfect for gallery walls',
  'portrait-18x24': 'Beautiful above a console',
  'portrait-24x36': 'Statement piece for living rooms',
  'portrait-30x40': 'Grand vertical presence',
  'portrait-32x48': 'Dramatic focal point',
  'portrait-40x60': 'Gallery-scale masterpiece',

  // Landscape
  'landscape-16x12': 'Great for entryway moments',
  'landscape-24x18': 'Ideal for above your desk',
  'landscape-36x24': 'Perfect above your sofa',
  'landscape-40x30': 'Living room focal wall',
  'landscape-48x32': 'Commanding great room feature',
  'landscape-60x40': 'Expansive horizontal showcase',

  // Square
  'square-16x16': 'Ideal for bedroom accents',
  'square-24x24': 'Perfect above your sofa',
  'square-32x32': 'Living room focal point',
  'square-36x36': 'Creates powerful presence',
};

/**
 * Get context copy for a canvas size
 * @param sizeKey - Canvas size identifier
 * @returns Contextual copy string or empty string if not found
 */
export function getCanvasSizeContextCopy(sizeKey: CanvasSizeKey): string {
  return CANVAS_SIZE_CONTEXT_COPY[sizeKey] || '';
}
