/**
 * Inspiration Buckets Configuration
 *
 * Curated style collections for the Style Inspiration section.
 * This configuration-driven approach enables zero-risk updates—marketing
 * can swap styles without touching component code.
 *
 * Performance notes:
 * - `as const` assertion enables deep readonly (TypeScript optimization)
 * - Union types prevent typos at compile time
 * - Readonly arrays prevent accidental mutations
 * - Commented expansion slots guide future 12-card scale
 *
 * @see src/sections/studio/StyleInspirationSection.tsx
 */

export type InspirationBucketConfig = {
  /** Unique bucket identifier */
  id: 'social' | 'print' | 'fun';
  /** Display title */
  title: string;
  /** Short description (1 sentence) */
  description: string;
  /** Icon type (maps to lucide-react icons) */
  icon: 'heart' | 'award' | 'palette';
  /** Hex color for accent theming */
  accentColor: string;
  /** Array of style IDs from styleRegistry.generated.ts */
  styleIds: readonly string[];
};

/**
 * Curated inspiration buckets
 *
 * Each bucket contains 6 styles initially, with commented placeholders
 * for future expansion to 12 cards (Phase 3).
 *
 * Style IDs must match entries in src/config/styles/styleRegistry.generated.ts
 */
export const INSPIRATION_BUCKETS: readonly InspirationBucketConfig[] = [
  {
    id: 'social',
    title: 'Best for Social',
    description: 'Eye-catching styles for feeds & stories',
    icon: 'heart',
    accentColor: '#f59e0b', // Amber - trending/vibrant
    styleIds: [
      'neon-splash',
      'electric-drip',
      'memphis-pop',
      'liquid-chrome',
      'retro-synthwave',
      '90s-cartoon',
      'pop-art-bust',
      'street-graffiti',
      'riso-punch',
      'glow-crayon',
      'holowire-prism',
      'fauve-splash',
      'modern-colorblock',
      'dot-symphony',
      'op-art-pulse',
    ],
  },
  {
    id: 'print',
    title: 'Print-Ready',
    description: 'Museum-quality for framing & display',
    icon: 'award',
    accentColor: '#d97706', // Darker amber - classic/timeless
    styleIds: [
      'classic-oil-painting',
      'gallery-acrylic',
      'the-renaissance',
      'watercolor-dreams',
      'calm-watercolor',
      'pastel-bliss',
      'deco-royale',
      'sumi-ink-whisper',
      'colored-pencil',
      'artisan-charcoal',
      'casso-cubist',
      'pop-surrealism',
      'classic-crayon',
      'abstract-chorus',
      'sanctuary-glow',
    ],
  },
  {
    id: 'fun',
    title: 'Just for Fun',
    description: 'Playful experiments & wild transformations',
    icon: 'palette',
    accentColor: '#d946ef', // Fuchsia - creative/energetic
    styleIds: [
      '3d-storybook',
      'voxel-mineworld',
      'porcelain-figurine',
      'bronze-statue',
      'ice-sculpture',
      'claymation-sculpt',
      'voxel-arcade',
      'plush-figure',
      'candy-gummy',
      'action-figure',
      'papercraft-layers',
      'glass-ripple',
      'hex-weave',
      'wax-candle',
      'sand-sculpture',
    ],
  },
] as const;

/**
 * Helper to get icon component name from string
 *
 * Keeps bucket component JSX clean by extracting icon logic.
 * Returns lucide-react icon component names as strings.
 *
 * @param iconName - Icon identifier from bucket config
 * @returns Icon component name for lucide-react import
 */
export const getIconComponent = (iconName: string): string => {
  switch (iconName) {
    case 'heart':
      return 'Heart';
    case 'award':
      return 'Award';
    case 'palette':
      return 'Palette';
    default:
      return 'Sparkles'; // Fallback icon
  }
};
