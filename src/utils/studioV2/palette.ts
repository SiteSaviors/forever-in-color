import type { PaletteSwatch } from '@/utils/storyLayer/copy';

export const expandPaletteSwatches = (
  swatches: PaletteSwatch[],
  targetCount = 6
): PaletteSwatch[] => {
  if (!Array.isArray(swatches) || swatches.length === 0) {
    return [];
  }

  if (swatches.length >= targetCount) {
    return swatches.slice(0, targetCount);
  }

  return swatches.slice();
};
