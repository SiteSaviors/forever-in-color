// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Run `npm run build:registry` to regenerate.

import type { StyleRegistryEntry } from '../types';

export const TONE_STYLES: StyleRegistryEntry[] = [
{
  id: "swiss-grid",
  slug: "swiss-grid",
  name: "Swiss Grid",
  tone: "abstract",
  tier: "free",
  category: "style",
  isPremium: false,
  defaultUnlocked: true,
  priceModifier: 0,
  description: "International Typographic precision with modular grids and calm tonal planes.",
  marketingCopy: "Frame portraits on a disciplined Swiss grid—clean geometry, intentional whitespace, and refined minimalism.",
  badges: ["design"],
  sortOrder: 80,
  assets: {
    thumbnail: "/art-style-thumbnails/modern-colorblock.jpg",
    thumbnailWebp: "/art-style-thumbnails/modern-colorblock.webp",
    thumbnailAvif: "/art-style-thumbnails/modern-colorblock.avif",
    preview: "/art-style-thumbnails/modern-colorblock.jpg",
    previewWebp: "/art-style-thumbnails/modern-colorblock.webp",
    previewAvif: "/art-style-thumbnails/modern-colorblock.avif",
  },
  featureFlags: {
    isEnabled: true,
    rolloutPercentage: 100,
    disabledReason: null,
  },
  prompt: {
    numericId: 16,
    prompt: "Recreate the exact image in an International Typographic Style (Swiss Grid) — precise, minimal, and rigorously aligned. Preserve the full composition and structure of the subject with accurate proportions. Translate forms into clean, flat tonal planes and simple geometric shapes; use a strict underlying grid with consistent margins, modular spacing, and a visible baseline rhythm.",
    updatedAt: "2025-10-16 07:13:28.066242+00",
  },
  story: null,
},
{
  id: "abstract-fusion",
  slug: "abstract-fusion",
  name: "Abstract Fusion",
  tone: "abstract",
  tier: "free",
  category: "style",
  isPremium: false,
  defaultUnlocked: true,
  priceModifier: 0,
  description: "Bold geometric abstraction with luminous color blocking.",
  marketingCopy: "Blend geometry and color for energetic abstract compositions.",
  badges: ["abstract"],
  sortOrder: 100,
  assets: {
    thumbnail: "/art-style-thumbnails/abstract-fusion.jpg",
    thumbnailWebp: "/art-style-thumbnails/abstract-fusion.webp",
    thumbnailAvif: "/art-style-thumbnails/abstract-fusion.avif",
    preview: "/art-style-thumbnails/abstract-fusion.jpg",
    previewWebp: "/art-style-thumbnails/abstract-fusion.webp",
    previewAvif: "/art-style-thumbnails/abstract-fusion.avif",
  },
  featureFlags: {
    isEnabled: true,
    rolloutPercentage: 100,
    disabledReason: null,
  },
  prompt: {
    numericId: 13,
    prompt: "Create abstract fusion art by blending watercolor, digital textures, and geometric patterns into a cohesive, expressive, multi-style composition. CRITICAL: Preserve the EXACT same person - same face, same eye color, same expression, same proportions, same pose. Do not alter any facial features, anatomical structure, or identifying characteristics.",
    updatedAt: "2025-10-16 07:13:28.066242+00",
  },
  story: null,
}
];

export const TONE_STYLES_BY_ID = new Map(TONE_STYLES.map((s) => [s.id, s]));
