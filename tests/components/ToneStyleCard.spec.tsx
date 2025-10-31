import { describe, expect, it } from 'vitest';
import renderer from 'react-test-renderer';
import ToneStyleCard from '@/sections/studio/components/ToneStyleCard';
import type { ToneSectionStyle } from '@/store/hooks/useToneSections';

const baseStyleEntry = (): ToneSectionStyle => ({
  option: {
    id: 'aurora-brush',
    name: 'Aurora Brush',
    description: 'Luminous strokes with aurora-inspired palettes.',
    thumbnail: 'https://cdn.example.com/thumb.jpg',
    thumbnailWebp: null,
    thumbnailAvif: null,
    preview: 'https://cdn.example.com/preview.jpg',
    previewWebp: null,
    previewAvif: null,
    priceModifier: 0,
  },
  metadataTone: 'classic',
  gate: {
    allowed: true,
    reason: 'allowed',
  },
  isSelected: false,
  isFavorite: false,
  readiness: {
    hasPreview: false,
    previewUrl: null,
    orientation: null,
    orientationMatches: true,
    source: null,
    completedAt: null,
    isRegenerating: false,
    isOrientationPending: false,
  },
});

const renderCard = (overrides: Partial<ToneSectionStyle>): renderer.ReactTestRenderer => {
  const entry = { ...baseStyleEntry(), ...overrides };
  return renderer.create(<ToneStyleCard styleEntry={entry} onSelect={() => {}} prefersReducedMotion />);
};

describe('ToneStyleCard ready indicator', () => {
  it('renders no ready ribbon when preview is unavailable', () => {
    const tree = renderCard({}).toJSON();
    const serialized = JSON.stringify(tree);
    expect(serialized).not.toContain('READY');
  });

  it('shows ready ribbon and state metadata when preview is available', () => {
    const card = renderCard({
      readiness: {
        ...baseStyleEntry().readiness,
        hasPreview: true,
        previewUrl: 'https://cdn.example.com/ready.jpg',
        source: 'live',
        orientation: 'square',
      },
    });

    const ribbons = card.root.findAll((node) => node.props['data-state'] === 'ready');
    expect(ribbons).toHaveLength(1);
    expect(ribbons[0].findByType('span').children.join('')).toBe('READY');
  });

  it('marks pending state when orientation refresh is in progress', () => {
    const card = renderCard({
      readiness: {
        ...baseStyleEntry().readiness,
        hasPreview: true,
        previewUrl: 'https://cdn.example.com/ready.jpg',
        source: 'cache',
        orientation: 'square',
        isOrientationPending: true,
        isRegenerating: true,
      },
    });

    const ribbons = card.root.findAll((node) => node.props['data-state'] === 'pending');
    expect(ribbons).toHaveLength(1);
  });
});
