import type { CanvasSizeKey } from '@/utils/canvasSizes';

export type CanvasPreviewAsset = {
  roomSrc: {
    none: string;
    black?: string;
    white?: string;
  };
  artRectPct: {
    none: {
      top: number;
      left: number;
      width: number;
      height: number;
    };
    black?: {
      top: number;
      left: number;
      width: number;
      height: number;
    };
    white?: {
      top: number;
      left: number;
      width: number;
      height: number;
    };
  };
};

const SQUARE_BASE = '/canvas-previews/square';

export const CANVAS_PREVIEW_ASSETS: Partial<Record<CanvasSizeKey, CanvasPreviewAsset>> = {
  'square-16x16': {
    roomSrc: {
      none: `${SQUARE_BASE}/square-16x16-unframed.webp`,
      black: `${SQUARE_BASE}/square-16x16-black.webp`,
      white: `${SQUARE_BASE}/square-16x16-white.webp`,
    },
    artRectPct: {
      none: { left: 0.278, top: 0.17, width: 0.459, height: 0.459 },
      black: { left: 0.328, top: 0.219, width: 0.373, height: 0.373 },
      white: { left: 0.27, top: 0.132, width: 0.47, height: 0.47 },
    },
  },
  'square-24x24': {
    roomSrc: {
      none: `${SQUARE_BASE}/square-24x24-unframed.webp`,
      black: `${SQUARE_BASE}/square-24x24-black.webp`,
      white: `${SQUARE_BASE}/square-24x24-white.webp`,
    },
    artRectPct: {
      none: { left: 0.1448, top: 0.12, width: 0.511, height: 0.511 },
      black: { left: 0.277, top: 0.169, width: 0.461, height: 0.461 },
      white: { left: 0.155, top: 0.13, width: 0.49, height: 0.49 },
    },
  },
  'square-32x32': {
    roomSrc: {
      none: `${SQUARE_BASE}/square-32x32-unframed.webp`,
      black: `${SQUARE_BASE}/square-32x32-black.webp`,
      white: `${SQUARE_BASE}/square-32x32-white.webp`,
    },
    artRectPct: {
      none: { left: 0.227, top: 0.073, width: 0.555, height: 0.555 },
      black: { left: 0.2599, top: 0.0911, width: 0.499, height: 0.499 },
      white: { left: 0.218, top: 0.078, width: 0.535, height: 0.535 },
    },
  },
  'square-36x36': {
    roomSrc: {
      none: `${SQUARE_BASE}/square-36x36-unframed.webp`,
      black: `${SQUARE_BASE}/square-36x36-black.webp`,
      white: `${SQUARE_BASE}/square-36x36-white.webp`,
    },
    artRectPct: {
      none: { left: 0.187, top: 0.081, width: 0.6265, height: 0.6265 },
      black: { left: 0.2175, top: 0.054, width: 0.549, height: 0.549 },
      white: { left: 0.196, top: 0.09, width: 0.60, height: 0.60 },
    },
  },
};
