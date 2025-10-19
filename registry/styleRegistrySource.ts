type StyleTone =
  | 'trending'
  | 'classic'
  | 'modern'
  | 'abstract'
  | 'stylized'
  | 'electric'
  | 'signature';

type StyleTier = 'free' | 'premium';

export type StyleRegistrySourceEntry = {
  /**
   * Stable slug used across the frontend, Supabase, and marketing surfaces.
   * Example: "classic-oil-painting"
   */
  id: string;
  /**
   * Human-readable display name.
   */
  name: string;
  /**
   * Pre-existing numeric identifier used by Supabase prompt tables.
   * Optional for styles that have not been provisioned in Supabase yet.
   */
  numericId?: number;
  /**
   * Tone classification for accordion grouping.
   * Original image is the only entry without a tone (null).
   */
  tone: StyleTone | null;
  tier: StyleTier;
  isPremium: boolean;
  defaultUnlocked: boolean;
  priceModifier: number;
  description: string;
  marketingCopy?: string | null;
  badges?: string[];
  requiredTier?: 'creator' | 'plus' | 'pro';
  sortOrder?: number;
  assets: {
    thumbnail: string;
    preview: string;
  };
  assetValidation?: {
    thumbnail?: boolean;
    preview?: boolean;
  };
  featureFlags?: {
    isEnabled?: boolean;
    rolloutPercentage?: number;
    disabledReason?: string;
  };
  /**
   * Category flag for future filtering. Defaults to "style".
   */
  category?: 'style' | 'original';
};

export const STYLE_REGISTRY_SOURCE: StyleRegistrySourceEntry[] = [
  {
    id: 'original-image',
    name: 'Original Image',
    numericId: 1,
    tone: null,
    tier: 'free',
    isPremium: false,
    defaultUnlocked: true,
    priceModifier: 0,
    description: 'Your photo untouched - classic canvas print.',
    marketingCopy: 'Keep it timeless with a faithful reproduction of your original photo.',
    badges: ['classic'],
     sortOrder: 0,
    assets: {
      thumbnail: '/art-style-thumbnails/original-image.jpg',
      preview: '/art-style-thumbnails/original-image.jpg',
    },
    category: 'original',
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
  },
  {
    id: 'classic-oil-painting',
    name: 'Classic Oil Painting',
    numericId: 2,
    tone: 'classic',
    tier: 'free',
    isPremium: false,
    defaultUnlocked: true,
    priceModifier: 0,
    description: 'Traditional oil painting texture with bold brush strokes.',
    marketingCopy: 'Channel the masters with rich brush strokes and museum-ready texture.',
    badges: ['classic'],
    sortOrder: 10,
    assets: {
      thumbnail: '/art-style-thumbnails/classic-oil-painting.jpg',
      preview: '/art-style-thumbnails/classic-oil-painting.jpg',
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
  },
  {
    id: 'watercolor-dreams',
    name: 'Watercolor Dreams',
    numericId: 4,
    tone: 'trending',
    tier: 'free',
    isPremium: false,
    defaultUnlocked: true,
    priceModifier: 0,
    description: 'Soft washes with gentle light leaks perfect for portraits.',
    marketingCopy: 'Give portraits a dreamy wash with soft watercolor gradients.',
    badges: ['trending'],
    sortOrder: 20,
    assets: {
      thumbnail: '/art-style-thumbnails/watercolor-dreams.jpg',
      preview: '/art-style-thumbnails/watercolor-dreams.jpg',
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
  },
  {
    id: 'pastel-bliss',
    name: 'Pastel Bliss',
    numericId: 5,
    tone: 'classic',
    tier: 'free',
    isPremium: false,
    defaultUnlocked: true,
    priceModifier: 0,
    description: 'Gentle color washes with soft grain highlights.',
    marketingCopy: 'Create calming canvases with airy pastels and gentle texture.',
    badges: ['soft'],
    sortOrder: 30,
    assets: {
      thumbnail: '/art-style-thumbnails/pastel-bliss.jpg',
      preview: '/art-style-thumbnails/pastel-bliss.jpg',
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
  },
  {
    id: '3d-storybook',
    name: '3D Storybook',
    numericId: 7,
    tone: 'modern',
    tier: 'free',
    isPremium: false,
    defaultUnlocked: true,
    priceModifier: 0,
    description: 'Whimsical 3D illustrated style with storybook charm.',
    marketingCopy: 'Bring characters to life with a whimsical 3D illustration finish.',
    badges: ['playful'],
    sortOrder: 40,
    assets: {
      thumbnail: '/art-style-thumbnails/3d-storybook.jpg',
      preview: '/art-style-thumbnails/3d-storybook.jpg',
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
  },
  {
    id: 'pop-art-burst',
    name: 'Pop Art Burst',
    numericId: 9,
    tone: 'stylized',
    tier: 'free',
    isPremium: false,
    defaultUnlocked: true,
    priceModifier: 0,
    description: 'Bold Warhol-inspired pop art with vibrant colors.',
    marketingCopy: 'Spin up high-energy canvases with comic book dots and punchy palettes.',
    badges: ['bold'],
    sortOrder: 50,
    assets: {
      thumbnail: '/art-style-thumbnails/pop-art-burst.jpg',
      preview: '/art-style-thumbnails/pop-art-burst.jpg',
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
  },
  {
    id: 'artisan-charcoal',
    name: 'Artisan Charcoal',
    numericId: 8,
    tone: 'classic',
    tier: 'free',
    isPremium: false,
    defaultUnlocked: true,
    priceModifier: 0,
    description: 'Hand-drawn charcoal artistry with dramatic shading.',
    marketingCopy: 'Sculpt dramatic portraits with handcrafted charcoal shading.',
    badges: ['sketch'],
    sortOrder: 60,
    assets: {
      thumbnail: '/art-style-thumbnails/artisan-charcoal.jpg',
      preview: '/art-style-thumbnails/artisan-charcoal.jpg',
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
  },
  {
    id: 'neon-splash',
    name: 'Neon Splash',
    numericId: 10,
    tone: 'electric',
    tier: 'free',
    isPremium: false,
    defaultUnlocked: true,
    priceModifier: 0,
    description: 'Electric neon splashes with vibrant energy.',
    marketingCopy: 'Ignite your portrait with neon streaks and kinetic color.',
    badges: ['neon'],
    sortOrder: 70,
    assets: {
      thumbnail: '/art-style-thumbnails/neon-splash.jpg',
      preview: '/art-style-thumbnails/neon-splash.jpg',
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
  },
  {
    id: 'electric-bloom',
    name: 'Electric Bloom',
    numericId: 11,
    tone: 'electric',
    tier: 'free',
    isPremium: false,
    defaultUnlocked: true,
    priceModifier: 0,
    description: 'Luminous bloom effects with electric color palettes.',
    marketingCopy: 'Flood the canvas with vivid blooms and luminous lighting.',
    badges: ['glow'],
    sortOrder: 80,
    assets: {
      thumbnail: '/art-style-thumbnails/electric-bloom.jpg',
      preview: '/art-style-thumbnails/electric-bloom.jpg',
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
  },
  {
    id: 'deco-luxe',
    name: 'Deco Luxe',
    numericId: 15,
    tone: 'stylized',
    tier: 'free',
    isPremium: false,
    defaultUnlocked: true,
    priceModifier: 0,
    description: 'Art Deco elegance with geometric luxury.',
    marketingCopy: 'Frame your subjects with gilded Art Deco geometry and glam.',
    badges: ['luxury'],
    sortOrder: 90,
    assets: {
      thumbnail: '/art-style-thumbnails/deco-luxe.jpg',
      preview: '/art-style-thumbnails/deco-luxe.jpg',
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
  },
  {
    id: 'abstract-fusion',
    name: 'Abstract Fusion',
    numericId: 13,
    tone: 'modern',
    tier: 'free',
    isPremium: false,
    defaultUnlocked: true,
    priceModifier: 0,
    description: 'Bold geometric abstraction with luminous color blocking.',
    marketingCopy: 'Blend geometry and color for energetic abstract compositions.',
    badges: ['modern'],
    sortOrder: 100,
    assets: {
      thumbnail: '/art-style-thumbnails/abstract-fusion.jpg',
      preview: '/art-style-thumbnails/abstract-fusion.jpg',
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
  },
  {
    id: 'gemstone-poly',
    name: 'Gemstone Poly',
    numericId: 6,
    tone: 'electric',
    tier: 'free',
    isPremium: false,
    defaultUnlocked: true,
    priceModifier: 0,
    description: 'Low-poly crystalline facets with gemstone brilliance.',
    marketingCopy: 'Cut portraits into shimmering gemstone-inspired facets.',
    badges: ['facet'],
    sortOrder: 110,
    assets: {
      thumbnail: '/art-style-thumbnails/gemstone-poly.jpg',
      preview: '/art-style-thumbnails/gemstone-poly.jpg',
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
  },
  {
    id: 'signature-aurora',
    name: 'Aurora Signature',
    tone: 'signature',
    tier: 'premium',
    isPremium: true,
    defaultUnlocked: false,
    priceModifier: 10,
    description: 'Premium aurora gradients layered with hand-painted highlights.',
    marketingCopy: 'Unlock Wondertone’s signature finish with luminous aurora light.',
    badges: ['exclusive', 'new'],
    requiredTier: 'plus',
    sortOrder: 120,
    assets: {
      thumbnail: '/art-style-thumbnails/signature-aurora.jpg',
      preview: '/art-style-thumbnails/signature-aurora.jpg',
    },
    assetValidation: {
      thumbnail: false,
      preview: false,
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
  },
];
