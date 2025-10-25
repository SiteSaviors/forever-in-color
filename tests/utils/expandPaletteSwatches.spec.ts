import { describe, expect, it } from 'vitest';
import { expandPaletteSwatches } from '@/utils/studioV2/palette';

const SAMPLE_SWATCHES = [
  { id: 'a', hex: '#ffffff', label: 'White', descriptor: 'Bright' },
  { id: 'b', hex: '#000000', label: 'Black', descriptor: 'Bold' },
  { id: 'c', hex: '#ff0000', label: 'Red', descriptor: 'Warm' },
] as const;

describe('expandPaletteSwatches', () => {
  it('returns empty array when provided no swatches', () => {
    expect(expandPaletteSwatches([])).toEqual([]);
  });

  it('pads swatches up to target count by repeating from the start', () => {
    const result = expandPaletteSwatches([...SAMPLE_SWATCHES], 6);
    expect(result).toHaveLength(6);
    expect(result[0]).toEqual(SAMPLE_SWATCHES[0]);
    expect(result[3]).toEqual(SAMPLE_SWATCHES[0]);
    expect(result[5]).toEqual(SAMPLE_SWATCHES[2]);
  });

  it('truncates when swatches exceed target count', () => {
    const result = expandPaletteSwatches(
      [...SAMPLE_SWATCHES, ...SAMPLE_SWATCHES],
      4
    );
    expect(result).toHaveLength(4);
  });
});
