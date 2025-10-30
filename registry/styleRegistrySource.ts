type StoryBulletIcon = 'sparkle' | 'home' | 'brush';

type StyleStoryBullet = {
  label: string;
  value: string;
  icon?: StoryBulletIcon;
};

type StyleStoryNarrative = {
  headline?: string;
  paragraph: string;
  bullets: StyleStoryBullet[];
};

type StyleStoryPaletteSwatch = {
  id: string;
  hex: string;
  label: string;
  descriptor: string;
};

type StyleStoryComplementary = {
  premium?: string | null;
  fallback: string;
};

type StyleStoryContent = {
  narrative?: StyleStoryNarrative;
  palette?: StyleStoryPaletteSwatch[];
  complementary?: StyleStoryComplementary;
} | null;

type StyleTone =
  | 'trending'
  | 'classic'
  | 'modern'
  | 'abstract'
  | 'stylized'
  | 'electric'
  | 'signature'
  | 'experimental';

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
  /**
   * Optional Story Layer content displayed in the Studio insights rail.
   * Provide per-style copy here for bespoke experiences. Any missing field
   * will automatically fall back to tone defaults in the UI helpers.
   */
  story?: StyleStoryContent;
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
    story: {
      narrative: {
        headline: 'The Story Behind Classic Oil',
        paragraph:
          'Classic Oil frames your portrait like a museum piece—rich pigments, heirloom brushwork, and softly lit warmth for timeless display.',
        bullets: [
          { label: 'Emotion', value: 'Heirloom nostalgia', icon: 'sparkle' },
          { label: 'Perfect for', value: 'Dining rooms · heritage walls', icon: 'home' },
          { label: 'Signature detail', value: 'Layered old-world brushstrokes', icon: 'brush' },
        ],
      },
      palette: [
        { id: 'oil-amber', hex: '#b37a3b', label: 'Heritage Amber', descriptor: 'Warms gallery lighting' },
        { id: 'oil-navy', hex: '#1e2a44', label: 'Midnight Navy', descriptor: 'Anchors vintage contrast' },
        { id: 'oil-cream', hex: '#f0ead6', label: 'Canvas Cream', descriptor: 'Softens skin tones' },
      ],
      complementary: {
        premium: 'pastel-bliss',
        fallback: 'calm-watercolor',
      },
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
    story: {
      narrative: {
        headline: 'The Story Behind Classic Oil',
        paragraph:
          'Classic Oil frames your portrait like a museum piece—rich pigments, heirloom brushwork, and softly lit warmth for timeless display.',
        bullets: [
          { label: 'Emotion', value: 'Heirloom nostalgia', icon: 'sparkle' },
          { label: 'Perfect for', value: 'Dining rooms · heritage walls', icon: 'home' },
          { label: 'Signature detail', value: 'Layered old-world brushstrokes', icon: 'brush' },
        ],
      },
      palette: [
        { id: 'oil-amber', hex: '#b37a3b', label: 'Heritage Amber', descriptor: 'Warms gallery lighting' },
        { id: 'oil-navy', hex: '#1e2a44', label: 'Midnight Navy', descriptor: 'Anchors vintage contrast' },
        { id: 'oil-cream', hex: '#f0ead6', label: 'Canvas Cream', descriptor: 'Softens skin tones' },
      ],
      complementary: {
        premium: 'pastel-bliss',
        fallback: 'calm-watercolor',
      },
    },
  },
  {
    id: 'calm-watercolor',
    name: 'Calm Watercolor',
    numericId: 20,
    tone: 'classic',
    tier: 'free',
    isPremium: false,
    defaultUnlocked: true,
    priceModifier: 0,
    description: 'Quiet watercolor washes with soft edges, luminous gradients, and gentle definition.',
    marketingCopy: 'Paint tranquil portraits with feathered wet-on-wet washes, whispered vignettes, and poised simplicity.',
    badges: ['classic'],
    sortOrder: 20,
    assets: {
      thumbnail: '/art-style-thumbnails/calm-watercolor.jpg',
      preview: '/art-style-thumbnails/calm-watercolor.jpg',
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
    story: {
      narrative: {
        headline: 'The Story Behind Watercolor Dreams',
        paragraph:
          'Watercolor Dreams bathes your memory in feathered washes and airy light leaks—gentle enough for bedrooms, expressive enough for your feed.',
        bullets: [
          { label: 'Emotion', value: 'Serene daydream', icon: 'sparkle' },
          { label: 'Perfect for', value: 'Nurseries · reflective corners', icon: 'home' },
          { label: 'Signature detail', value: 'Hand-splashed watercolor bloom', icon: 'brush' },
        ],
      },
      palette: [
        { id: 'wc-coral', hex: '#f7a7a6', label: 'Blush Coral', descriptor: 'Lifts rosy highlights' },
        { id: 'wc-lavender', hex: '#c7b6e9', label: 'Mist Lavender', descriptor: 'Keeps the wash airy' },
        { id: 'wc-mist', hex: '#e8eef3', label: 'Cloud Mist', descriptor: 'Adds dreamy negative space' },
      ],
      complementary: {
        premium: 'pastel-bliss',
        fallback: 'calm-watercolor',
      },
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
      thumbnail: '/art-style-thumbnails/gallery-acrylic.jpg',
      preview: '/art-style-thumbnails/gallery-acrylic.jpg',
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
    story: {
      narrative: {
        headline: 'The Story Behind Pastel Bliss',
        paragraph:
          'Pastel Bliss drapes your portrait in soft pastels, tactile grain, and morning-light warmth—ideal for cozy retreats and calming spaces.',
        bullets: [
          { label: 'Emotion', value: 'Weightless calm', icon: 'sparkle' },
          { label: 'Perfect for', value: 'Bedrooms · wellness corners', icon: 'home' },
          { label: 'Signature detail', value: 'Velvet pastel gradients and soft grain', icon: 'brush' },
        ],
      },
      palette: [
        { id: 'pastel-rose', hex: '#f8cbd6', label: 'Petal Rose', descriptor: 'Softens portraits' },
        { id: 'pastel-mint', hex: '#c8eddc', label: 'Mint Haze', descriptor: 'Calms the palette' },
        { id: 'pastel-cream', hex: '#fdf2e9', label: 'Sunrise Cream', descriptor: 'Adds daylight warmth' },
      ],
      complementary: {
        premium: 'sanctuary-glow',
        fallback: 'calm-watercolor',
      },
    },
  },
  {
    id: 'watercolor-dreams',
    name: 'Watercolor Dreams',
    numericId: 4,
    tone: 'signature',
    tier: 'free',
    isPremium: false,
    defaultUnlocked: true,
    priceModifier: 0,
    description: 'Soft washes with gentle light leaks perfect for portraits.',
    marketingCopy: 'Give portraits a dreamy wash with soft watercolor gradients.',
    badges: ['signature'],
    sortOrder: 20,
    assets: {
      thumbnail: '/art-style-thumbnails/watercolor-dreams.jpg',
      preview: '/art-style-thumbnails/watercolor-dreams.jpg',
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
    story: {
      narrative: {
        headline: 'The Story Behind Watercolor Dreams',
        paragraph:
          'Watercolor Dreams bathes your memory in feathered washes and airy light leaks—gentle enough for bedrooms, expressive enough for your feed.',
        bullets: [
          { label: 'Emotion', value: 'Serene daydream', icon: 'sparkle' },
          { label: 'Perfect for', value: 'Nurseries · reflective corners', icon: 'home' },
          { label: 'Signature detail', value: 'Hand-splashed watercolor bloom', icon: 'brush' },
        ],
      },
      palette: [
        { id: 'wc-coral', hex: '#f7a7a6', label: 'Blush Coral', descriptor: 'Lifts rosy highlights' },
        { id: 'wc-lavender', hex: '#c7b6e9', label: 'Mist Lavender', descriptor: 'Keeps the wash airy' },
        { id: 'wc-mist', hex: '#e8eef3', label: 'Cloud Mist', descriptor: 'Adds dreamy negative space' },
      ],
      complementary: {
        premium: 'pastel-bliss',
        fallback: 'calm-watercolor',
      },
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
    story: {
      narrative: {
        headline: 'The Story Behind Pastel Bliss',
        paragraph:
          'Pastel Bliss drapes your portrait in soft pastels, tactile grain, and morning-light warmth—ideal for cozy retreats and calming spaces.',
        bullets: [
          { label: 'Emotion', value: 'Weightless calm', icon: 'sparkle' },
          { label: 'Perfect for', value: 'Bedrooms · wellness corners', icon: 'home' },
          { label: 'Signature detail', value: 'Velvet pastel gradients and soft grain', icon: 'brush' },
        ],
      },
      palette: [
        { id: 'pastel-rose', hex: '#f8cbd6', label: 'Petal Rose', descriptor: 'Softens portraits' },
        { id: 'pastel-mint', hex: '#c8eddc', label: 'Mint Haze', descriptor: 'Calms the palette' },
        { id: 'pastel-cream', hex: '#fdf2e9', label: 'Sunrise Cream', descriptor: 'Adds daylight warmth' },
      ],
      complementary: {
        premium: 'sanctuary-glow',
        fallback: 'calm-watercolor',
      },
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
      thumbnail: '/art-style-thumbnails/pop-art.jpg',
      preview: '/art-style-thumbnails/pop-art.jpg',
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
    story: {
      narrative: {
        headline: 'The Story Behind Neon Splash',
        paragraph:
          'Neon Splash explodes with electric motion—UV drips, kinetic streaks, and stage-worthy glow that turns any capture into nightlife art.',
        bullets: [
          { label: 'Emotion', value: 'Electric adrenaline', icon: 'sparkle' },
          { label: 'Perfect for', value: 'Game rooms · celebration walls', icon: 'home' },
          { label: 'Signature detail', value: 'Neon paint trails with UV bloom', icon: 'brush' },
        ],
      },
      palette: [
        { id: 'neon-magenta', hex: '#ff2eb7', label: 'UV Magenta', descriptor: 'Injects night-life energy' },
        { id: 'neon-cyan', hex: '#19d4ff', label: 'Electric Cyan', descriptor: 'Slices through the dark' },
        { id: 'neon-amber', hex: '#ffb428', label: 'Pulse Amber', descriptor: 'Adds kinetic accents' },
      ],
      complementary: {
        premium: 'electric-drip',
        fallback: 'pop-art-bust',
      },
    },
  },
  {
    id: 'modern-colorblock',
    name: 'Modern Colorblock',
    numericId: 3,
    tone: 'modern',
    tier: 'free',
    isPremium: false,
    defaultUnlocked: true,
    priceModifier: 0,
    description: 'Hard-edged color planes with poster-like negative space and crisp balance.',
    marketingCopy: 'Compose gallery-ready portraits from pure color blocks, confident geometry, and modern negative space.',
    badges: ['modern'],
    sortOrder: 50,
    assets: {
      thumbnail: '/art-style-thumbnails/modern-colorblock.jpg',
      preview: '/art-style-thumbnails/modern-colorblock.jpg',
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
  },
  {
    id: 'dot-symphony',
    name: 'Dot Symphony',
    numericId: 19,
    tone: 'modern',
    tier: 'free',
    isPremium: false,
    defaultUnlocked: true,
    priceModifier: 0,
    description: 'Pointillist portraits rendered from luminous dot constellations and vibrating color.',
    marketingCopy: 'Weave thousands of radiant dots into shimmering pointillist portraits that stay true to every contour.',
    badges: ['artful'],
    sortOrder: 60,
    assets: {
      thumbnail: '/art-style-thumbnails/dot-symphony.jpg',
      preview: '/art-style-thumbnails/dot-symphony.jpg',
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
  },
  {
    id: 'fauve-splash',
    name: 'Fauve Splash',
    numericId: 18,
    tone: 'modern',
    tier: 'free',
    isPremium: false,
    defaultUnlocked: true,
    priceModifier: 0,
    description: 'Fauvist color bursts with liberated brushwork and joyful tonal exaggeration.',
    marketingCopy: 'Channel fearless Fauve energy with high-key palettes, confident strokes, and exuberant emotion.',
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
    id: 'hex-weave',
    name: 'Hex Weave',
    numericId: 29,
    tone: 'abstract',
    tier: 'free',
    isPremium: false,
    defaultUnlocked: true,
    priceModifier: 0,
    description: 'Interlocking hexagonal tessellations with soft gradients and woven light.',
    marketingCopy: 'Wrap your portrait in geometric weaving—honeycomb planes, gleaming threads, and luminous negative space.',
    badges: ['abstract'],
    sortOrder: 80,
    assets: {
      thumbnail: '/art-style-thumbnails/hex-weave.jpg',
      preview: '/art-style-thumbnails/hex-weave.jpg',
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
  },
  {
    id: 'prisma-tesla',
    name: 'Prisma Tesla',
    numericId: 30,
    tone: 'abstract',
    tier: 'free',
    isPremium: false,
    defaultUnlocked: true,
    priceModifier: 0,
    description: 'Electro-spectrum prisms and field lines bending portrait contours.',
    marketingCopy: 'Charge your art with neon prismatic flares, kinetic filaments, and energized negative space.',
    badges: ['abstract'],
    sortOrder: 90,
    assets: {
      thumbnail: '/art-style-thumbnails/prisma-tesla.jpg',
      preview: '/art-style-thumbnails/prisma-tesla.jpg',
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
  },
  {
    id: 'op-art-pulse',
    name: 'Op Art Pulse',
    numericId: 31,
    tone: 'abstract',
    tier: 'free',
    isPremium: false,
    defaultUnlocked: true,
    priceModifier: 0,
    description: 'Hypnotic moiré bands and vibrating contrasts with portrait silhouettes.',
    marketingCopy: 'Spin optical rhythms around your subject—pulsing wave grids, stark monochrome beats, and kinetic energy.',
    badges: ['abstract'],
    sortOrder: 100,
    assets: {
      thumbnail: '/art-style-thumbnails/op-art-pulse.jpg',
      preview: '/art-style-thumbnails/op-art-pulse.jpg',
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
  },
  {
    id: 'street-graffiti',
    name: 'Street Graffiti',
    numericId: 26,
    tone: 'modern',
    tier: 'free',
    isPremium: false,
    defaultUnlocked: true,
    priceModifier: 0,
    description: 'Layered street stencil treatment with bold contrast and urban grit.',
    marketingCopy: 'Hit city walls with crisp stencils, overspray halos, and concrete texture that make portraits pop.',
    badges: ['urban'],
    sortOrder: 95,
    assets: {
      thumbnail: '/art-style-thumbnails/street-graffiti.jpg',
      preview: '/art-style-thumbnails/street-graffiti.jpg',
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
  },
  {
    id: 'riso-punch',
    name: 'Riso Punch',
    numericId: 17,
    tone: 'modern',
    tier: 'free',
    isPremium: false,
    defaultUnlocked: true,
    priceModifier: 0,
    description: 'Risograph spot inks with tactile grain, layered screens, and playful misregistration.',
    marketingCopy: 'Deliver punchy risograph posters with fluorescent inks, halftone grit, and energetic off-register overlays.',
    badges: ['print'],
    sortOrder: 90,
    assets: {
      thumbnail: '/art-style-thumbnails/riso-punch.jpg',
      preview: '/art-style-thumbnails/riso-punch.jpg',
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
    id: '90s-cartoon',
    name: '90s Cartoon',
    numericId: 21,
    tone: 'stylized',
    tier: 'free',
    isPremium: false,
    defaultUnlocked: true,
    priceModifier: 0,
    description: 'Saturday-morning cartoon lines with flat cel shading and exaggerated poses.',
    marketingCopy: 'Channel nostalgic 90s animation with thick outlines, two-step cel shading, and punchy weekend palettes.',
    badges: ['nostalgia'],
    sortOrder: 50,
    assets: {
      thumbnail: '/art-style-thumbnails/90s-cartoon.jpg',
      preview: '/art-style-thumbnails/90s-cartoon.jpg',
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
  },
  {
    id: 'pop-surrealism',
    name: 'Pop Surrealism',
    numericId: 22,
    tone: 'stylized',
    tier: 'premium',
    isPremium: true,
    defaultUnlocked: false,
    priceModifier: 0,
    description: 'Hyperreal portraits drifting through dreamy, candy-colored surrealism.',
    marketingCopy: 'Blend painterly realism with whimsical skies, glowing highlights, and fairytale emotion.',
    badges: ['dream'],
    requiredTier: 'creator',
    sortOrder: 60,
    assets: {
      thumbnail: '/art-style-thumbnails/pop-surrealism.jpg',
      preview: '/art-style-thumbnails/pop-surrealism.jpg',
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
  },
  {
    id: 'papercraft-layers',
    name: 'Papercraft Layers',
    numericId: 23,
    tone: 'stylized',
    tier: 'premium',
    isPremium: true,
    defaultUnlocked: false,
    priceModifier: 0,
    description: 'Dimensional papercraft collage built from crisp cut shapes and soft shadows.',
    marketingCopy: 'Stack handcrafted cardstock layers with precise edges, subtle bevels, and tactile drop shadows.',
    badges: ['crafted'],
    requiredTier: 'creator',
    sortOrder: 70,
    assets: {
      thumbnail: '/art-style-thumbnails/papercraft.jpg',
      preview: '/art-style-thumbnails/papercraft.jpg',
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
  },
  {
    id: 'voxel-mineworld',
    name: 'Voxel Mineworld',
    numericId: 24,
    tone: 'stylized',
    tier: 'premium',
    isPremium: true,
    defaultUnlocked: false,
    priceModifier: 0,
    description: 'Chunky sandbox voxels rebuild portraits with crisp cubes and pixel textures.',
    marketingCopy: 'Transform memories into playful voxel dioramas with clean silhouettes and ambient-lit cubes.',
    badges: ['voxel'],
    requiredTier: 'creator',
    sortOrder: 80,
    assets: {
      thumbnail: '/art-style-thumbnails/voxel-mineworld.jpg',
      preview: '/art-style-thumbnails/voxel-mineworld.jpg',
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
  },
  {
    id: 'claymation-sculpt',
    name: 'Claymation Sculpt',
    numericId: 25,
    tone: 'stylized',
    tier: 'premium',
    isPremium: true,
    defaultUnlocked: false,
    priceModifier: 0,
    description: 'Stop-motion clay portraiture with hand-molded texture and studio lighting.',
    marketingCopy: 'Give portraits a tactile claymation finish with thumbprint detail, sculpted cuts, and warm tabletop light.',
    badges: ['whimsical'],
    requiredTier: 'creator',
    sortOrder: 90,
    assets: {
      thumbnail: '/art-style-thumbnails/clay.jpg',
      preview: '/art-style-thumbnails/clay.jpg',
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
      thumbnail: '/art-style-thumbnails/classic-crayon.jpg',
      preview: '/art-style-thumbnails/classic-crayon.jpg',
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
    story: {
      narrative: {
        headline: 'The Story Behind Neon Splash',
        paragraph:
          'Neon Splash explodes with electric motion—UV drips, kinetic streaks, and stage-worthy glow that turns any capture into nightlife art.',
        bullets: [
          { label: 'Emotion', value: 'Electric adrenaline', icon: 'sparkle' },
          { label: 'Perfect for', value: 'Game rooms · celebration walls', icon: 'home' },
          { label: 'Signature detail', value: 'Neon paint trails with UV bloom', icon: 'brush' },
        ],
      },
      palette: [
        { id: 'neon-magenta', hex: '#ff2eb7', label: 'UV Magenta', descriptor: 'Injects night-life energy' },
        { id: 'neon-cyan', hex: '#19d4ff', label: 'Electric Cyan', descriptor: 'Slices through the dark' },
        { id: 'neon-amber', hex: '#ffb428', label: 'Pulse Amber', descriptor: 'Adds kinetic accents' },
      ],
      complementary: {
        premium: 'electric-drip',
        fallback: 'pop-art-bust',
      },
    },
  },
  {
    id: 'electric-drip',
    name: 'Electric Drip',
    numericId: 11,
    tone: 'electric',
    tier: 'free',
    isPremium: false,
    defaultUnlocked: true,
    priceModifier: 0,
    description: 'Fluorescent paint pours cascading into neon bloom and kinetic splatter.',
    marketingCopy: 'Coat your portraits in liquid neon drips, gravity streaks, and UV rim light energy.',
    badges: ['neon'],
    sortOrder: 80,
    assets: {
      thumbnail: '/art-style-thumbnails/electric-drip.jpg',
      preview: '/art-style-thumbnails/electric-drip.jpg',
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
  },
  {
    id: 'glow-crayon',
    name: 'Glow Crayon',
    numericId: 27,
    tone: 'electric',
    tier: 'premium',
    isPremium: true,
    defaultUnlocked: false,
    priceModifier: 0,
    description: 'Hand-drawn neon wax strokes with blacklight glow and vibrant edge lighting.',
    marketingCopy: 'Upgrade to neon wax crayon portraits with luminous outlines, iridescent shading, and studio pop.',
    badges: ['glow'],
    requiredTier: 'creator',
    sortOrder: 90,
    assets: {
      thumbnail: '/art-style-thumbnails/glow-crayon.jpg',
      preview: '/art-style-thumbnails/glow-crayon.jpg',
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
  },
  {
    id: 'casso-cubist',
    name: 'Casso Cubist',
    numericId: 32,
    tone: 'abstract',
    tier: 'premium',
    isPremium: true,
    defaultUnlocked: false,
    priceModifier: 0,
    description: 'Shattered planes, angular faceting, and gallery-grade cubist lighting.',
    marketingCopy: 'Unlock cubist geometry—braided viewpoints, luxe palettes, and sculpted planes worthy of a salon wall.',
    badges: ['abstract', 'premium'],
    requiredTier: 'creator',
    sortOrder: 110,
    assets: {
      thumbnail: '/art-style-thumbnails/casso-cubist.jpg',
      preview: '/art-style-thumbnails/casso-cubist.jpg',
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
  },
  {
    id: 'sumi-ink-whisper',
    name: 'Sumi Ink Whisper',
    numericId: 33,
    tone: 'abstract',
    tier: 'premium',
    isPremium: true,
    defaultUnlocked: false,
    priceModifier: 0,
    description: 'Feathered ink washes and serene negative space with meditative linework.',
    marketingCopy: 'Unlock tranquil sumi expression—floating washes, quiet gradients, and lyrical brush cadence.',
    badges: ['abstract', 'premium'],
    requiredTier: 'creator',
    sortOrder: 120,
    assets: {
      thumbnail: '/art-style-thumbnails/sumi-ink-whisper.jpg',
      preview: '/art-style-thumbnails/sumi-ink-whisper.jpg',
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
  },
  {
    id: 'abstract-chorus',
    name: 'Abstract Chorus',
    numericId: 34,
    tone: 'abstract',
    tier: 'premium',
    isPremium: true,
    defaultUnlocked: false,
    priceModifier: 0,
    description: 'Layered color harmonies with musical arcs and gestural echoes.',
    marketingCopy: 'Unlock a chorus of color—syncopated arcs, lyrical gradients, and resonant painterly movement.',
    badges: ['abstract', 'premium'],
    requiredTier: 'creator',
    sortOrder: 130,
    assets: {
      thumbnail: '/art-style-thumbnails/abstract-chorus.jpg',
      preview: '/art-style-thumbnails/abstract-chorus.jpg',
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
  },
  {
    id: 'voxel-arcade',
    name: 'Voxel Arcade',
    numericId: 35,
    tone: 'electric',
    tier: 'premium',
    isPremium: true,
    defaultUnlocked: false,
    priceModifier: 0,
    description: 'Voxel portraits lit like arcade cabinets with neon bloom and pixel glow.',
    marketingCopy: 'Unlock voxel arcade dioramas brimming with neon stripes, CRT bloom, and retro-futuristic energy.',
    badges: ['voxel'],
    requiredTier: 'creator',
    sortOrder: 100,
    assets: {
      thumbnail: '/art-style-thumbnails/voxel-arcade.jpg',
      preview: '/art-style-thumbnails/voxel-arcade.jpg',
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
  },
  {
    id: 'retro-synthwave',
    name: 'Retro Synthwave',
    numericId: 37,
    tone: 'electric',
    tier: 'premium',
    isPremium: true,
    defaultUnlocked: false,
    priceModifier: 0,
    description: 'Synthwave gradients, scanline glow, and retro-futuristic light trails.',
    marketingCopy: 'Unlock premium synthwave portraits with sunset gradients, chromed highlights, and retro glitch energy.',
    badges: ['neon'],
    requiredTier: 'creator',
    sortOrder: 110,
    assets: {
      thumbnail: '/art-style-thumbnails/retro-synthwave.jpg',
      preview: '/art-style-thumbnails/retro-synthwave.jpg',
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
  },
  {
    id: 'holowire-prism',
    name: 'Holowire Prism',
    numericId: 36,
    tone: 'electric',
    tier: 'premium',
    isPremium: true,
    defaultUnlocked: false,
    priceModifier: 0,
    description: 'Holographic wireframes refracted through neon prisms and chromatic bloom.',
    marketingCopy: 'Unlock premium holowire portraits layered with radiant prisms, glitch refractions, and luminous haze.',
    badges: ['holo'],
    requiredTier: 'creator',
    sortOrder: 120,
    assets: {
      thumbnail: '/art-style-thumbnails/holowire-prism.jpg',
      preview: '/art-style-thumbnails/holowire-prism.jpg',
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
  },
  {
    id: 'plush-figure',
    name: 'Plush Figure',
    numericId: 44,
    tone: 'experimental',
    tier: 'premium',
    isPremium: true,
    defaultUnlocked: false,
    priceModifier: 0,
    description: 'Hand-sewn felt panels and cozy stitches.',
    marketingCopy: 'Transform your portrait into a plush keepsake—hand-stitched felt seams, soft stuffing, and storybook charm.',
    badges: ['premium'],
    requiredTier: 'creator',
    sortOrder: 80,
    assets: {
      thumbnail: '/art-style-thumbnails/plush-figure.jpg',
      preview: '/art-style-thumbnails/plush-figure.jpg',
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
    story: null,
  },
  {
    id: 'candy-gummy',
    name: 'Candy Gummy',
    numericId: 45,
    tone: 'experimental',
    tier: 'premium',
    isPremium: true,
    defaultUnlocked: false,
    priceModifier: 0,
    description: 'Translucent jelly glow with tiny bubbles.',
    marketingCopy: 'Render your photo as a gummy treat—sparkling translucency, candy hues, and gleaming sugar bubbles suspended inside.',
    badges: ['premium'],
    requiredTier: 'creator',
    sortOrder: 90,
    assets: {
      thumbnail: '/art-style-thumbnails/candy-gummy.jpg',
      preview: '/art-style-thumbnails/candy-gummy.jpg',
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
    story: null,
  },
  {
    id: 'action-figure',
    name: 'Action Figure',
    numericId: 46,
    tone: 'experimental',
    tier: 'premium',
    isPremium: true,
    defaultUnlocked: false,
    priceModifier: 0,
    description: 'Poseable toy geometry with clean joints.',
    marketingCopy: 'Strike a heroic pose—collector-grade plastic forms, snap-fit armor, and precise articulation points on every limb.',
    badges: ['premium'],
    requiredTier: 'creator',
    sortOrder: 100,
    assets: {
      thumbnail: '/art-style-thumbnails/action-figure.jpg',
      preview: '/art-style-thumbnails/action-figure.jpg',
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
    story: null,
  },
  {
    id: 'porcelain-figurine',
    name: 'Porcelain Figurine',
    numericId: 28,
    tone: 'experimental',
    tier: 'premium',
    isPremium: true,
    defaultUnlocked: false,
    priceModifier: 0,
    description: 'Glazed ceramic shine with gold trim.',
    marketingCopy: 'Elevate every detail with porcelain glaze, lustrous highlights, and hand-painted gold filigree worthy of a display cabinet.',
    badges: ['premium'],
    requiredTier: 'creator',
    sortOrder: 110,
    assets: {
      thumbnail: '/art-style-thumbnails/porcelain-figurine.jpg',
      preview: '/art-style-thumbnails/porcelain-figurine.jpg',
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
    story: null,
  },
  {
    id: 'ice-sculpture',
    name: 'Ice Sculpture',
    numericId: 47,
    tone: 'experimental',
    tier: 'premium',
    isPremium: true,
    defaultUnlocked: false,
    priceModifier: 0,
    description: 'Chisel-cut crystal with frosty edges.',
    marketingCopy: 'Carve your subject from crystal-clear ice—faceted planes, frosted edges, and refractive glow straight from a winter gala.',
    badges: ['premium'],
    requiredTier: 'creator',
    sortOrder: 120,
    assets: {
      thumbnail: '/art-style-thumbnails/ice-sculpture.jpg',
      preview: '/art-style-thumbnails/ice-sculpture.jpg',
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
    story: null,
  },
  {
    id: 'bronze-statue',
    name: 'Bronze Statue',
    numericId: 48,
    tone: 'experimental',
    tier: 'premium',
    isPremium: true,
    defaultUnlocked: false,
    priceModifier: 0,
    description: 'Cast-metal patina on a plinth.',
    marketingCopy: 'Celebrate timeless craftsmanship—cast bronze patina, engraved plinth, and gallery-ready museum lighting.',
    badges: ['premium'],
    requiredTier: 'creator',
    sortOrder: 130,
    assets: {
      thumbnail: '/art-style-thumbnails/bronze-statue.jpg',
      preview: '/art-style-thumbnails/bronze-statue.jpg',
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
    story: null,
  },
  {
    id: 'wax-candle',
    name: 'Wax Candle',
    numericId: 49,
    tone: 'experimental',
    tier: 'premium',
    isPremium: true,
    defaultUnlocked: false,
    priceModifier: 0,
    description: 'Translucent wax with wick and soft drips.',
    marketingCopy: 'Melt into a luminous candle form—translucent wax, glowing core, and delicate drips descending toward the base.',
    badges: ['premium'],
    requiredTier: 'creator',
    sortOrder: 140,
    assets: {
      thumbnail: '/art-style-thumbnails/wax-candle.jpg',
      preview: '/art-style-thumbnails/wax-candle.jpg',
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
    story: null,
  },
  {
    id: 'sand-sculpture',
    name: 'Sand Sculpture',
    numericId: 50,
    tone: 'experimental',
    tier: 'premium',
    isPremium: true,
    defaultUnlocked: false,
    priceModifier: 0,
    description: 'Compacted grains, crisp trowel cuts.',
    marketingCopy: 'Reimagine your portrait in sculpted sand—compacted grain texture, sharp trowel cuts, and windswept coastal shading.',
    badges: ['premium'],
    requiredTier: 'creator',
    sortOrder: 150,
    assets: {
      thumbnail: '/art-style-thumbnails/sand-sculpture.jpg',
      preview: '/art-style-thumbnails/sand-sculpture.jpg',
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
    story: null,
  },
  {
    id: 'colored-pencil',
    name: 'Colored Pencil',
    numericId: 38,
    tone: 'signature',
    tier: 'premium',
    isPremium: true,
    defaultUnlocked: false,
    priceModifier: 0,
    description: 'Layered strokes with paper tooth.',
    marketingCopy: 'Build rich depth with layered colored pencil strokes, delicate hatchwork, and pressed highlights.',
    badges: ['premium'],
    requiredTier: 'creator',
    sortOrder: 110,
    assets: {
      thumbnail: '/art-style-thumbnails/colored-pencil.jpg',
      preview: '/art-style-thumbnails/colored-pencil.jpg',
    },
    assetValidation: {
      thumbnail: false,
      preview: false,
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
    story: null,
  },
  {
    id: 'memphis-pop',
    name: 'Memphis Pop',
    numericId: 39,
    tone: 'signature',
    tier: 'premium',
    isPremium: true,
    defaultUnlocked: false,
    priceModifier: 0,
    description: 'Playful geometry, electric color.',
    marketingCopy: 'Channel bold 80s energy with Memphis-inspired geometry, pattern punches, and high-voltage color.',
    badges: ['premium'],
    requiredTier: 'creator',
    sortOrder: 120,
    assets: {
      thumbnail: '/art-style-thumbnails/memphis-pop.jpg',
      preview: '/art-style-thumbnails/memphis-pop.jpg',
    },
    assetValidation: {
      thumbnail: false,
      preview: false,
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
    story: null,
  },
  {
    id: 'liquid-chrome',
    name: 'Liquid Chrome',
    numericId: 40,
    tone: 'signature',
    tier: 'premium',
    isPremium: true,
    defaultUnlocked: false,
    priceModifier: 0,
    description: 'Mercury sheen, stretched highlights.',
    marketingCopy: 'Wrap every contour in fluid metal with reflective chrome gradients and studio-grade specular beams.',
    badges: ['premium'],
    requiredTier: 'creator',
    sortOrder: 130,
    assets: {
      thumbnail: '/art-style-thumbnails/liquid-chrome.jpg',
      preview: '/art-style-thumbnails/liquid-chrome.jpg',
    },
    assetValidation: {
      thumbnail: false,
      preview: false,
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
    story: null,
  },
  {
    id: 'glass-ripple',
    name: 'Glass Ripple',
    numericId: 41,
    tone: 'signature',
    tier: 'premium',
    isPremium: true,
    defaultUnlocked: false,
    priceModifier: 0,
    description: 'Refractive panes with bright rims.',
    marketingCopy: 'Refract portraits through layered glass panes, luminous rim lights, and iridescent ripple caustics.',
    badges: ['premium'],
    requiredTier: 'creator',
    sortOrder: 140,
    assets: {
      thumbnail: '/art-style-thumbnails/glass-ripple.jpg',
      preview: '/art-style-thumbnails/glass-ripple.jpg',
    },
    assetValidation: {
      thumbnail: false,
      preview: false,
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
    story: null,
  },
  {
    id: 'deco-royale',
    name: 'Deco Royale',
    numericId: 15,
    tone: 'signature',
    tier: 'premium',
    isPremium: true,
    defaultUnlocked: false,
    priceModifier: 0,
    description: 'Stepped geometry, luxe metallics.',
    marketingCopy: 'Crown your subject with stepped Art Deco geometry, lacquered panels, and gilded metallic trims.',
    badges: ['premium'],
    requiredTier: 'creator',
    sortOrder: 150,
    assets: {
      thumbnail: '/art-style-thumbnails/deco-royale.jpg',
      preview: '/art-style-thumbnails/deco-royale.jpg',
    },
    assetValidation: {
      thumbnail: false,
      preview: false,
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
    story: null,
  },
  {
    id: 'the-renaissance',
    name: 'The Renaissance',
    numericId: 42,
    tone: 'signature',
    tier: 'premium',
    isPremium: true,
    defaultUnlocked: false,
    priceModifier: 0,
    description: 'Old-master light, gilded accents.',
    marketingCopy: 'Invoke old-master drama with layered oil glazes, chiaroscuro lighting, and gilded frame flourishes.',
    badges: ['premium'],
    requiredTier: 'creator',
    sortOrder: 160,
    assets: {
      thumbnail: '/art-style-thumbnails/the-renaissance.jpg',
      preview: '/art-style-thumbnails/the-renaissance.jpg',
    },
    assetValidation: {
      thumbnail: false,
      preview: false,
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
    story: null,
  },
  {
    id: 'sanctuary-glow',
    name: 'Sanctuary Glow',
    numericId: 43,
    tone: 'signature',
    tier: 'premium',
    isPremium: true,
    defaultUnlocked: false,
    priceModifier: 0,
    description: 'Luminous stained-glass aura.',
    marketingCopy: 'Cast ethereal stained-glass radiance with prismatic gradients, soft bloom, and cathedral halos.',
    badges: ['premium'],
    requiredTier: 'creator',
    sortOrder: 170,
    assets: {
      thumbnail: '/art-style-thumbnails/sanctuary-glow.jpg',
      preview: '/art-style-thumbnails/sanctuary-glow.jpg',
    },
    assetValidation: {
      thumbnail: false,
      preview: false,
    },
    featureFlags: {
      isEnabled: true,
      rolloutPercentage: 100,
    },
    story: null,
  },
];
