import { describe, it, expect } from 'vitest';
import type { StyleOption } from '@/store/useFounderStore';
import { getNarrative, getPalette, getComplementaryStyles, getShareCaption } from '@/utils/storyLayer/copy';

const mockStyle = (overrides: Partial<StyleOption>): StyleOption => ({
  id: 'mock-style',
  name: 'Mock Style',
  description: '',
  thumbnail: '',
  preview: '',
  priceModifier: 0,
  thumbnailWebp: null,
  thumbnailAvif: null,
  previewWebp: null,
  previewAvif: null,
  tone: 'modern',
  tier: 'free',
  isPremium: false,
  defaultUnlocked: true,
  marketingCopy: null,
  badges: [],
  requiredTier: undefined,
  ...overrides,
});

describe('storyLayer copy helpers', () => {
  it('returns bespoke narrative when defined', () => {
    const narrative = getNarrative(
      mockStyle({ id: 'classic-oil-painting', tone: 'classic', name: 'Classic Oil Painting' })
    );
    expect(narrative.headline).toContain('Classic Oil');
  });

  it('falls back to tone narrative when bespoke missing', () => {
    const narrative = getNarrative(mockStyle({ tone: 'modern', name: 'Modern Edge' }));
    expect(narrative.headline).toContain('Modern Edge');
    expect(narrative.paragraph).toContain('graphic clarity');
  });

  it('returns bespoke palette when available', () => {
    const palette = getPalette(mockStyle({ id: 'neon-splash', tone: 'electric' }));
    expect(palette[0].label).toBe('UV Magenta');
  });

  it('falls back to tone palette when bespoke missing', () => {
    const palette = getPalette(mockStyle({ tone: 'stylized' }));
    expect(palette).toHaveLength(3);
    expect(palette[0].label).toBe('Storybook Fuchsia');
  });

  it('returns bespoke complementary mapping', () => {
    const comp = getComplementaryStyles(mockStyle({ id: 'pastel-bliss', tone: 'classic' }));
    expect(comp.premium).toBe('signature-aurora');
    expect(comp.fallback).toBe('calm-watercolor');
  });

  it('returns tone complementary when bespoke missing', () => {
    const comp = getComplementaryStyles(mockStyle({ tone: 'electric' }));
    expect(comp.fallback).toBe('neon-splash');
  });

  it('builds share caption with tone hook and tier tag', () => {
    const caption = getShareCaption({ tone: 'signature', styleName: 'Aurora Signature', tier: 'creator' });
    expect(caption).toContain('Wondertone’s Aurora Signature');
    expect(caption).toContain('Creator Member');
  });

  it('falls back to classic share copy when tone missing', () => {
    const caption = getShareCaption({ tone: null, styleName: 'Mystery Style', tier: 'free' });
    expect(caption).toContain('Timeless strokes');
    expect(caption).toContain('Free Preview');
  });
});
