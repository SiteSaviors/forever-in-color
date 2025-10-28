// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Run `npm run build:registry` to regenerate.

import type { StyleRegistryEntry } from '../types';

export const TONE_STYLES: StyleRegistryEntry[] = [
{
  id: "original-image",
  slug: "original-image",
  name: "Original Image",
  tone: null,
  tier: "free",
  category: "original",
  isPremium: false,
  defaultUnlocked: true,
  priceModifier: 0,
  description: "Your photo untouched - classic canvas print.",
  marketingCopy: "Keep it timeless with a faithful reproduction of your original photo.",
  badges: ["classic"],
  sortOrder: 0,
  assets: {
    thumbnail: "/art-style-thumbnails/original-image.jpg",
    thumbnailWebp: "/art-style-thumbnails/original-image.webp",
    thumbnailAvif: "/art-style-thumbnails/original-image.avif",
    preview: "/art-style-thumbnails/original-image.jpg",
    previewWebp: "/art-style-thumbnails/original-image.webp",
    previewAvif: "/art-style-thumbnails/original-image.avif",
  },
  featureFlags: {
    isEnabled: true,
    rolloutPercentage: 100,
    disabledReason: null,
  },
  prompt: {
    numericId: 1,
    prompt: "Keep the image exactly as is, no artistic transformation",
    updatedAt: "2025-10-16 07:13:28.066242+00",
  },
  story: {
    "narrative": {
      "headline": "The Story Behind Classic Oil",
      "paragraph": "Classic Oil frames your portrait like a museum piece—rich pigments, heirloom brushwork, and softly lit warmth for timeless display.",
      "bullets": [
        {
          "label": "Emotion",
          "value": "Heirloom nostalgia",
          "icon": "sparkle"
        },
        {
          "label": "Perfect for",
          "value": "Dining rooms · heritage walls",
          "icon": "home"
        },
        {
          "label": "Signature detail",
          "value": "Layered old-world brushstrokes",
          "icon": "brush"
        }
      ]
    },
    "palette": [
      {
        "id": "oil-amber",
        "hex": "#b37a3b",
        "label": "Heritage Amber",
        "descriptor": "Warms gallery lighting"
      },
      {
        "id": "oil-navy",
        "hex": "#1e2a44",
        "label": "Midnight Navy",
        "descriptor": "Anchors vintage contrast"
      },
      {
        "id": "oil-cream",
        "hex": "#f0ead6",
        "label": "Canvas Cream",
        "descriptor": "Softens skin tones"
      }
    ],
    "complementary": {
      "premium": "pastel-bliss",
      "fallback": "calm-watercolor"
    }
  },
}
];

export const TONE_STYLES_BY_ID = new Map(TONE_STYLES.map((s) => [s.id, s]));
