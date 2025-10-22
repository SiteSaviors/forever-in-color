import { STYLE_REGISTRY } from './styles/styleRegistry.generated';
import type {
  StyleRegistryEntry,
  StyleTone,
  StyleTier,
  StyleToneDefinition,
} from './styles/types';

export type { StyleRegistryEntry, StyleTone, StyleTier } from './styles/types';
export {
  STYLE_REGISTRY,
  STYLE_REGISTRY_BY_ID,
  STYLE_REGISTRY_BY_NUMERIC_ID,
} from './styles/styleRegistry.generated';

export type StyleCatalogEntry = {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  thumbnailWebp?: string | null;
  thumbnailAvif?: string | null;
  preview: string;
  previewWebp?: string | null;
  previewAvif?: string | null;
  priceModifier: number;
  tone: StyleTone;
  tier: StyleTier;
  isPremium: boolean;
  badges?: string[];
  defaultUnlocked: boolean;
  marketingCopy?: string | null;
  requiredTier?: 'creator' | 'plus' | 'pro';
};

export type StyleOptionSnapshot = {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  thumbnailWebp?: string | null;
  thumbnailAvif?: string | null;
  preview: string;
  previewWebp?: string | null;
  previewAvif?: string | null;
  priceModifier: number;
};

const FALLBACK_TONE_FOR_ORIGINAL: StyleTone = 'classic';

const toCatalogEntry = (style: StyleRegistryEntry): StyleCatalogEntry => {
  const badges = style.badges.length > 0 ? style.badges : undefined;
  return {
    id: style.id,
    name: style.name,
    description: style.description,
    thumbnail: style.assets.thumbnail,
    thumbnailWebp: style.assets.thumbnailWebp ?? null,
    thumbnailAvif: style.assets.thumbnailAvif ?? null,
    preview: style.assets.preview,
    previewWebp: style.assets.previewWebp ?? null,
    previewAvif: style.assets.previewAvif ?? null,
    priceModifier: style.priceModifier,
    tone: style.tone ?? FALLBACK_TONE_FOR_ORIGINAL,
    tier: style.tier,
    isPremium: style.isPremium,
    badges,
    defaultUnlocked: style.defaultUnlocked,
    marketingCopy: style.marketingCopy ?? null,
    requiredTier: style.requiredTier,
  };
};

export const STYLE_CATALOG: StyleCatalogEntry[] = STYLE_REGISTRY.map(toCatalogEntry);

export const loadInitialStyles = (): StyleOptionSnapshot[] =>
  STYLE_CATALOG.map(
    ({
      id,
      name,
      description,
      thumbnail,
      thumbnailWebp,
      thumbnailAvif,
      preview,
      previewWebp,
      previewAvif,
      priceModifier,
    }): StyleOptionSnapshot => ({
      id,
      name,
      description,
      thumbnail,
      thumbnailWebp: thumbnailWebp ?? null,
      thumbnailAvif: thumbnailAvif ?? null,
      preview,
      previewWebp: previewWebp ?? null,
      previewAvif: previewAvif ?? null,
      priceModifier,
    })
  );

export const STYLE_TONE_DEFINITIONS: Record<StyleTone, StyleToneDefinition> = {
  trending: {
    id: 'trending',
    label: 'Trending Styles',
    description: 'Most-loved styles from the Wondertone community this week.',
    icon: '📈',
    sortOrder: 10,
  },
  classic: {
    id: 'classic',
    label: 'Classic Styles',
    description: 'Timeless treatments that never go out of style.',
    icon: '🎨',
    sortOrder: 20,
  },
  modern: {
    id: 'modern',
    label: 'Modern Styles',
    description: 'Fresh, design-forward looks for contemporary art lovers.',
    icon: '✨',
    sortOrder: 30,
  },
  stylized: {
    id: 'stylized',
    label: 'Stylized Art',
    description: 'Statement-making looks for bold storytellers.',
    icon: '🎭',
    sortOrder: 40,
  },
  abstract: {
    id: 'abstract',
    label: 'Abstract Styles',
    description: 'Geometry, pattern, and non-literal color.',
    icon: '🔷',
    sortOrder: 45,
  },
  electric: {
    id: 'electric',
    label: 'Neon Glitch Styles',
    description: 'High-voltage neon, synthwave, and glitch-inspired treatments.',
    icon: '⚡',
    sortOrder: 50,
  },
  signature: {
    id: 'signature',
    label: 'Signature Styles',
    description: 'Premium exclusives crafted by the Wondertone studio.',
    icon: '⭐',
    sortOrder: 60,
    requiredTier: 'creator',
  },
};

export const STYLE_TONES_IN_ORDER: StyleTone[] = Object.values(STYLE_TONE_DEFINITIONS)
  .sort((a, b) => a.sortOrder - b.sortOrder)
  .map((definition) => definition.id);
