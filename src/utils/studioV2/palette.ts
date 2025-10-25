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

  const expanded = [...swatches];
  let index = 0;
  while (expanded.length < targetCount) {
    expanded.push(swatches[index % swatches.length]);
    index += 1;
  }
  return expanded.slice(0, targetCount);
};
