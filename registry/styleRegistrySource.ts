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
    id: 'calm-watercolor',
    name: 'Calm Watercolor',
    tone: 'classic',
    tier: 'free',
    isPremium: false,
    defaultUnlocked: true,
    priceModifier: 0,
    description: 'Tranquil watercolor washes with softened edges and gentle gradients.',
    marketingCopy: 'Paint serene portraits with calm washes, softened edges, and luminous highlights.',
    badges: ['classic'],
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
    id: 'gallery-acrylic',
    name: 'Gallery Acrylic',
    numericId: 14,
    tone: 'classic',
    tier: 'free',
    isPremium: false,
    defaultUnlocked: true,
    priceModifier: 0,
    description: 'Rich acrylic layering with bold gallery brushwork and depth.',
    marketingCopy: 'Layer bold acrylic strokes for a gallery-ready canvas packed with depth.',
    badges: ['classic'],
    sortOrder: 25,
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
    tier: 'premium',
    isPremium: true,
    defaultUnlocked: false,
    priceModifier: 0,
    description: 'Gentle color washes with soft grain highlights.',
    marketingCopy: 'Create calming canvases with airy pastels and gentle texture.',
    badges: ['soft'],
    sortOrder: 30,
    assets: {
      thumbnail: '/art-style-thumbnails/pastel-bliss.jpg',
      preview: '/art-style-thumbnails/pastel-bliss.jpg',
    },
    requiredTier: 'creator',
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
  },
  {
    id: 'pop-art-bust',
    name: 'Pop Art Bust',
    tone: 'modern',
    tier: 'free',
    isPremium: false,
    defaultUnlocked: true,
    priceModifier: 0,
    description: 'Bold pop art bust portraits with graphic halftones and sculpted contrast.',
    marketingCopy: 'Deliver gallery-ready bust portraits with saturated halftones and punchy graphic shading.',
    badges: ['bold'],
    sortOrder: 40,
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
    id: 'modern-colorblock',
    name: 'Modern Colorblock',
    tone: 'modern',
    tier: 'free',
    isPremium: false,
    defaultUnlocked: true,
    priceModifier: 0,
    description: 'Minimalist color blocking with crisp geometry and contemporary balance.',
    marketingCopy: 'Compose sleek, modern canvases using confident shapes, layered blocks, and refined palettes.',
    badges: ['modern'],
    sortOrder: 50,
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
    id: 'dot-symphony',
    name: 'Dot Symphony',
    tone: 'modern',
    tier: 'free',
    isPremium: false,
    defaultUnlocked: true,
    priceModifier: 0,
    description: 'Pointillist energy rendered as dense dot constellations and radiant glow.',
    marketingCopy: 'Weave a pointillist tapestry of luminous dots that preserve facial detail and vibrant motion.',
    badges: ['artful'],
    sortOrder: 60,
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
    id: 'fauve-splash',
    name: 'Fauve Splash',
    tone: 'modern',
    tier: 'free',
    isPremium: false,
    defaultUnlocked: true,
    priceModifier: 0,
    description: 'Fauvist bursts of wild color with expressive brushwork and liberated form.',
    marketingCopy: 'Channel Fauvism with fearless palettes, loose strokes, and joyful tonal exaggeration.',
    badges: ['expressive'],
    sortOrder: 70,
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
    id: 'swiss-grid',
    name: 'Swiss Grid',
    tone: 'modern',
    tier: 'free',
    isPremium: false,
    defaultUnlocked: true,
    priceModifier: 0,
    description: 'Precision Swiss Grid layout treatment with typographic structure and calm color.',
    marketingCopy: 'Frame portraits with disciplined Swiss graphic design—clean lines, modular grids, and intentional whitespace.',
    badges: ['design'],
    sortOrder: 80,
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
    id: 'riso-punch',
    name: 'Riso Punch',
    tone: 'modern',
    tier: 'free',
    isPremium: false,
    defaultUnlocked: true,
    priceModifier: 0,
    description: 'Riso-inspired spot inks with tactile grain and layered registration shifts.',
    marketingCopy: 'Deliver vibrant risograph flavor with overlapping spot inks, subtle misregistration, and tangible paper grain.',
    badges: ['print'],
    sortOrder: 90,
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
    id: '3d-storybook',
    name: '3D Storybook',
    numericId: 7,
    tone: 'stylized',
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
    tier: 'premium',
    isPremium: true,
    defaultUnlocked: false,
    priceModifier: 0,
    description: 'Hand-drawn charcoal artistry with dramatic shading.',
    marketingCopy: 'Sculpt dramatic portraits with handcrafted charcoal shading.',
    badges: ['sketch'],
    sortOrder: 40,
    assets: {
      thumbnail: '/art-style-thumbnails/artisan-charcoal.jpg',
      preview: '/art-style-thumbnails/artisan-charcoal.jpg',
    },
    requiredTier: 'creator',
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
  },
  {
    id: 'classic-crayon',
    name: 'Classic Crayon',
    numericId: 12,
    tone: 'classic',
    tier: 'premium',
    isPremium: true,
    defaultUnlocked: false,
    priceModifier: 0,
    description: 'Layered crayon strokes with nostalgic paper grain and hand-drawn warmth.',
    marketingCopy: 'Blend soft waxy hues and storybook charm for a handcrafted crayon keepsake.',
    badges: ['classic'],
    sortOrder: 50,
    assets: {
      thumbnail: '/art-style-thumbnails/artisan-charcoal.jpg',
      preview: '/art-style-thumbnails/artisan-charcoal.jpg',
    },
    requiredTier: 'creator',
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
    tone: 'abstract',
    tier: 'free',
    isPremium: false,
    defaultUnlocked: true,
    priceModifier: 0,
    description: 'Bold geometric abstraction with luminous color blocking.',
    marketingCopy: 'Blend geometry and color for energetic abstract compositions.',
    badges: ['abstract'],
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
