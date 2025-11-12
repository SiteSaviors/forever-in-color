import type { CanvasSizeKey } from '@/utils/canvasSizes';

const SQUARE_BASE = '/canvas-previews/square';

export const CANVAS_PREVIEW_ASSETS: Partial<Record<CanvasSizeKey, string>> = {
  'square-16x16': `${SQUARE_BASE}/square-16x16-unframed.webp`,
  'square-24x24': `${SQUARE_BASE}/square-24x24-unframed.webp`,
  'square-32x32': `${SQUARE_BASE}/square-32x32-unframed.webp`,
  'square-36x36': `${SQUARE_BASE}/square-36x36-unframed.webp`,
};
