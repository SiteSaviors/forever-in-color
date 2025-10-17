export type StyleTone =
  | 'trending'
  | 'classic'
  | 'modern'
  | 'stylized'
  | 'electric'
  | 'signature';

export type StyleTier = 'free' | 'premium';

export type StyleCatalogEntry = {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  preview: string;
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
  preview: string;
  priceModifier: number;
};

export const STYLE_CATALOG: StyleCatalogEntry[] = [
  {
    id: 'original-image',
    name: 'Original Image',
    description: 'Your photo untouched - classic canvas print.',
    thumbnail: '/art-style-thumbnails/original-image.jpg',
    preview: '/art-style-thumbnails/original-image.jpg',
    priceModifier: 0,
    tone: 'classic',
    tier: 'free',
    isPremium: false,
    badges: ['classic'],
    defaultUnlocked: true,
    marketingCopy: 'Keep it timeless with a faithful reproduction of your original photo.',
  },
  {
    id: 'classic-oil-painting',
    name: 'Classic Oil Painting',
    description: 'Traditional oil painting texture with bold brush strokes.',
    thumbnail: '/art-style-thumbnails/classic-oil-painting.jpg',
    preview: '/art-style-thumbnails/classic-oil-painting.jpg',
    priceModifier: 0,
    tone: 'classic',
    tier: 'free',
    isPremium: false,
    badges: ['classic'],
    defaultUnlocked: true,
    marketingCopy: 'Channel the masters with rich brush strokes and museum-ready texture.',
  },
  {
    id: 'watercolor-dreams',
    name: 'Watercolor Dreams',
    description: 'Soft washes with gentle light leaks perfect for portraits.',
    thumbnail: '/art-style-thumbnails/watercolor-dreams.jpg',
    preview: '/art-style-thumbnails/watercolor-dreams.jpg',
    priceModifier: 0,
    tone: 'trending',
    tier: 'free',
    isPremium: false,
    badges: ['trending'],
    defaultUnlocked: true,
    marketingCopy: 'Give portraits a dreamy wash with soft watercolor gradients.',
  },
  {
    id: 'pastel-bliss',
    name: 'Pastel Bliss',
    description: 'Gentle color washes with soft grain highlights.',
    thumbnail: '/art-style-thumbnails/pastel-bliss.jpg',
    preview: '/art-style-thumbnails/pastel-bliss.jpg',
    priceModifier: 0,
    tone: 'classic',
    tier: 'free',
    isPremium: false,
    badges: ['soft'],
    defaultUnlocked: true,
    marketingCopy: 'Create calming canvases with airy pastels and gentle texture.',
  },
  {
    id: '3d-storybook',
    name: '3D Storybook',
    description: 'Whimsical 3D illustrated style with storybook charm.',
    thumbnail: '/art-style-thumbnails/3d-storybook.jpg',
    preview: '/art-style-thumbnails/3d-storybook.jpg',
    priceModifier: 0,
    tone: 'modern',
    tier: 'free',
    isPremium: false,
    badges: ['playful'],
    defaultUnlocked: true,
    marketingCopy: 'Bring characters to life with a whimsical 3D illustration finish.',
  },
  {
    id: 'pop-art-burst',
    name: 'Pop Art Burst',
    description: 'Bold Warhol-inspired pop art with vibrant colors.',
    thumbnail: '/art-style-thumbnails/pop-art-burst.jpg',
    preview: '/art-style-thumbnails/pop-art-burst.jpg',
    priceModifier: 0,
    tone: 'stylized',
    tier: 'free',
    isPremium: false,
    badges: ['bold'],
    defaultUnlocked: true,
    marketingCopy: 'Spin up high-energy canvases with comic book dots and punchy palettes.',
  },
  {
    id: 'artisan-charcoal',
    name: 'Artisan Charcoal',
    description: 'Hand-drawn charcoal artistry with dramatic shading.',
    thumbnail: '/art-style-thumbnails/artisan-charcoal.jpg',
    preview: '/art-style-thumbnails/artisan-charcoal.jpg',
    priceModifier: 0,
    tone: 'classic',
    tier: 'free',
    isPremium: false,
    badges: ['sketch'],
    defaultUnlocked: true,
    marketingCopy: 'Sculpt dramatic portraits with handcrafted charcoal shading.',
  },
  {
    id: 'neon-splash',
    name: 'Neon Splash',
    description: 'Electric neon splashes with vibrant energy.',
    thumbnail: '/art-style-thumbnails/neon-splash.jpg',
    preview: '/art-style-thumbnails/neon-splash.jpg',
    priceModifier: 0,
    tone: 'electric',
    tier: 'free',
    isPremium: false,
    badges: ['neon'],
    defaultUnlocked: true,
    marketingCopy: 'Ignite your portrait with neon streaks and kinetic color.',
  },
  {
    id: 'electric-bloom',
    name: 'Electric Bloom',
    description: 'Luminous bloom effects with electric color palettes.',
    thumbnail: '/art-style-thumbnails/electric-bloom.jpg',
    preview: '/art-style-thumbnails/electric-bloom.jpg',
    priceModifier: 0,
    tone: 'electric',
    tier: 'free',
    isPremium: false,
    badges: ['glow'],
    defaultUnlocked: true,
    marketingCopy: 'Flood the canvas with vivid blooms and luminous lighting.',
  },
  {
    id: 'deco-luxe',
    name: 'Deco Luxe',
    description: 'Art Deco elegance with geometric luxury.',
    thumbnail: '/art-style-thumbnails/deco-luxe.jpg',
    preview: '/art-style-thumbnails/deco-luxe.jpg',
    priceModifier: 0,
    tone: 'stylized',
    tier: 'free',
    isPremium: false,
    badges: ['luxury'],
    defaultUnlocked: true,
    marketingCopy: 'Frame your subjects with gilded Art Deco geometry and glam.',
  },
  {
    id: 'abstract-fusion',
    name: 'Abstract Fusion',
    description: 'Bold geometric abstraction with luminous color blocking.',
    thumbnail: '/art-style-thumbnails/abstract-fusion.jpg',
    preview: '/art-style-thumbnails/abstract-fusion.jpg',
    priceModifier: 0,
    tone: 'modern',
    tier: 'free',
    isPremium: false,
    badges: ['modern'],
    defaultUnlocked: true,
    marketingCopy: 'Blend geometry and color for energetic abstract compositions.',
  },
  {
    id: 'gemstone-poly',
    name: 'Gemstone Poly',
    description: 'Low-poly crystalline facets with gemstone brilliance.',
    thumbnail: '/art-style-thumbnails/gemstone-poly.jpg',
    preview: '/art-style-thumbnails/gemstone-poly.jpg',
    priceModifier: 0,
    tone: 'electric',
    tier: 'free',
    isPremium: false,
    badges: ['facet'],
    defaultUnlocked: true,
    marketingCopy: 'Cut portraits into shimmering gemstone-inspired facets.',
  },
];

export const loadInitialStyles = (): StyleOptionSnapshot[] =>
  STYLE_CATALOG.map(
    ({ id, name, description, thumbnail, preview, priceModifier }): StyleOptionSnapshot => ({
      id,
      name,
      description,
      thumbnail,
      preview,
      priceModifier,
    })
  );
