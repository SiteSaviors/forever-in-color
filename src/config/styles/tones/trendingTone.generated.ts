// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Run `npm run build:registry` to regenerate.

import type { StyleRegistryEntry } from '../types';

export const TONE_STYLES: StyleRegistryEntry[] = [
{
  id: "watercolor-dreams",
  slug: "watercolor-dreams",
  name: "Watercolor Dreams",
  tone: "trending",
  tier: "free",
  category: "style",
  isPremium: false,
  defaultUnlocked: true,
  priceModifier: 0,
  description: "Soft washes with gentle light leaks perfect for portraits.",
  marketingCopy: "Give portraits a dreamy wash with soft watercolor gradients.",
  badges: ["trending"],
  sortOrder: 20,
  assets: {
    thumbnail: "/art-style-thumbnails/watercolor-dreams.jpg",
    thumbnailWebp: "/art-style-thumbnails/watercolor-dreams.webp",
    thumbnailAvif: "/art-style-thumbnails/watercolor-dreams.avif",
    preview: "/art-style-thumbnails/watercolor-dreams.jpg",
    previewWebp: "/art-style-thumbnails/watercolor-dreams.webp",
    previewAvif: "/art-style-thumbnails/watercolor-dreams.avif",
  },
  featureFlags: {
    isEnabled: true,
    rolloutPercentage: 100,
    disabledReason: null,
  },
  prompt: {
    numericId: 4,
    prompt: "Recreate the exact image in an expressive watercolor style — bold, dynamic, and emotionally vibrant. Preserve the full composition and structure of the subject, including the subject's pose, features, proportions, and spatial arrangement. Use loose, energetic brushwork, vivid splashes of color, and spontaneous paint drips to convey movement and feeling. Let pigments flow and merge unpredictably, creating a painterly abstraction around the subject without distorting the core details. Emphasize contrast, texture, and fluid transitions, with a sense of joyful chaos that enhances — not overwhelms — the subject's presence. The result should feel alive and impressionistic, yet true to the original image.",
    updatedAt: "2025-10-16 07:13:28.066242+00",
  },
  story: {
    "narrative": {
      "headline": "The Story Behind Watercolor Dreams",
      "paragraph": "Watercolor Dreams bathes your memory in feathered washes and airy light leaks—gentle enough for bedrooms, expressive enough for your feed.",
      "bullets": [
        {
          "label": "Emotion",
          "value": "Serene daydream",
          "icon": "sparkle"
        },
        {
          "label": "Perfect for",
          "value": "Nurseries · reflective corners",
          "icon": "home"
        },
        {
          "label": "Signature detail",
          "value": "Hand-splashed watercolor bloom",
          "icon": "brush"
        }
      ]
    },
    "palette": [
      {
        "id": "wc-coral",
        "hex": "#f7a7a6",
        "label": "Blush Coral",
        "descriptor": "Lifts rosy highlights"
      },
      {
        "id": "wc-lavender",
        "hex": "#c7b6e9",
        "label": "Mist Lavender",
        "descriptor": "Keeps the wash airy"
      },
      {
        "id": "wc-mist",
        "hex": "#e8eef3",
        "label": "Cloud Mist",
        "descriptor": "Adds dreamy negative space"
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
