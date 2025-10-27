import type { StyleOption, EntitlementTier } from '@/store/useFounderStore';
import { STYLE_REGISTRY_BY_ID, type StyleTone } from '@/config/styleCatalog';

type Narrative = {
  headline: string;
  paragraph: string;
  bullets: Array<{ label: string; value: string; icon: 'sparkle' | 'home' | 'brush' }>;
};

type PaletteSwatch = {
  id: string;
  hex: string;
  label: string;
  descriptor: string;
};

type ComplementaryStyles = {
  premium: string | null;
  fallback: string;
};

type ShareCaptionConfig = {
  tone: StyleTone | null;
  styleName: string;
  tier: EntitlementTier;
};

type TonePaletteMap = Record<Exclude<StyleTone, null>, PaletteSwatch[]>;
type ToneComplementaryMap = Record<Exclude<StyleTone, null>, ComplementaryStyles>;

type ToneNarrativeFactory = (styleName: string) => Narrative;
const toneNarratives: Record<Exclude<StyleTone, null>, ToneNarrativeFactory> = {
  classic: (styleName) => ({
    headline: `The story behind ${styleName}`,
    paragraph:
      `${styleName} embraces gallery tradition—layered brushwork, warm tones, and balanced composition to honor your original photograph.`,
    bullets: [
      { label: 'Emotion', value: 'Warm nostalgia', icon: 'sparkle' },
      { label: 'Perfect for', value: 'Living rooms · dining spaces', icon: 'home' },
      { label: 'Signature detail', value: 'Hand-rendered brush textures', icon: 'brush' },
    ],
  }),
  trending: (styleName) => ({
    headline: `${styleName} in focus`,
    paragraph:
      `${styleName} pours soft gradients and light leaks into your portrait, adding modern editorial flair without losing the heartfelt core.`,
    bullets: [
      { label: 'Emotion', value: 'Dreamy uplift', icon: 'sparkle' },
      { label: 'Perfect for', value: 'Bedrooms · gifting moments', icon: 'home' },
      { label: 'Signature detail', value: 'Feathered watercolor glow', icon: 'brush' },
    ],
  }),
  modern: (styleName) => ({
    headline: `${styleName}, decoded`,
    paragraph:
      `${styleName} sharpens contrast and shapes, giving your image graphic clarity grounded in contemporary design language.`,
    bullets: [
      { label: 'Emotion', value: 'Confident energy', icon: 'sparkle' },
      { label: 'Perfect for', value: 'Studios · creative hubs', icon: 'home' },
      { label: 'Signature detail', value: 'Crisp halftone & geometric rhythm', icon: 'brush' },
    ],
  }),
  stylized: (styleName) => ({
    headline: `${styleName} brings it to life`,
    paragraph:
      `${styleName} infuses animated personality—playful modeling, expressive lines, and saturated palettes that make the story pop.`,
    bullets: [
      { label: 'Emotion', value: 'Playful imagination', icon: 'sparkle' },
      { label: 'Perfect for', value: 'Kid spaces · creative nooks', icon: 'home' },
      { label: 'Signature detail', value: 'Character-driven highlights', icon: 'brush' },
    ],
  }),
  electric: (styleName) => ({
    headline: `${styleName} ignites the frame`,
    paragraph:
      `${styleName} drenches your portrait in kinetic glow—neon streaks, light trails, and club energy designed for share moments.`,
    bullets: [
      { label: 'Emotion', value: 'High-voltage thrill', icon: 'sparkle' },
      { label: 'Perfect for', value: 'Nightlife · celebration walls', icon: 'home' },
      { label: 'Signature detail', value: 'Radiant neon splashes', icon: 'brush' },
    ],
  }),
  signature: (styleName) => ({
    headline: `${styleName} signature notes`,
    paragraph:
      `${styleName} is Wondertone’s premium finish—luminous gradients, bespoke accents, and a finish crafted for collectors.`,
    bullets: [
      { label: 'Emotion', value: 'Luxurious calm', icon: 'sparkle' },
      { label: 'Perfect for', value: 'Gallery walls · gifting keepsakes', icon: 'home' },
      { label: 'Signature detail', value: 'Aurora light and bespoke highlights', icon: 'brush' },
    ],
  }),
};

const BULLET_ICON_DEFAULTS: Record<string, Narrative['bullets'][number]['icon']> = {
  emotion: 'sparkle',
  'perfect for': 'home',
  'signature detail': 'brush',
};

const resolveBulletIcon = (label: string): Narrative['bullets'][number]['icon'] => {
  const normalized = label.trim().toLowerCase();
  return BULLET_ICON_DEFAULTS[normalized] ?? 'sparkle';
};


const tonePalettes: TonePaletteMap = {
  classic: [
    { id: 'classic-gold', hex: '#d1a168', label: 'Museum Gold', descriptor: 'Warms traditional interiors' },
    { id: 'classic-brown', hex: '#7a5538', label: 'Chestnut Umber', descriptor: 'Adds heirloom weight' },
    { id: 'classic-navy', hex: '#1f2a3f', label: 'Gallery Navy', descriptor: 'Frames portrait highlights' },
  ],
  trending: [
    { id: 'trend-rose', hex: '#f3a5b7', label: 'Sunset Rose', descriptor: 'Softens skin and sky' },
    { id: 'trend-lilac', hex: '#c9c2f5', label: 'Lilac Glow', descriptor: 'Adds dreamy translucence' },
    { id: 'trend-pearl', hex: '#f2f4f8', label: 'Pearl Mist', descriptor: 'Keeps things weightless' },
  ],
  modern: [
    { id: 'modern-emerald', hex: '#18a688', label: 'Modern Emerald', descriptor: 'Pushes crisp contrast' },
    { id: 'modern-charcoal', hex: '#2b2f3a', label: 'Graphite Charcoal', descriptor: 'Grounds bold lines' },
    { id: 'modern-cream', hex: '#f7f3eb', label: 'Matte Ivory', descriptor: 'Balances the palette' },
  ],
  stylized: [
    { id: 'stylized-fuchsia', hex: '#e051d1', label: 'Storybook Fuchsia', descriptor: 'Energizes characters' },
    { id: 'stylized-sky', hex: '#69c0f1', label: 'Hero Sky', descriptor: 'Keeps scenes playful' },
    { id: 'stylized-sun', hex: '#ffce6b', label: 'Sunburst Amber', descriptor: 'Adds animated warmth' },
  ],
  electric: [
    { id: 'electric-cyan', hex: '#15d0f0', label: 'Future Cyan', descriptor: 'Amplifies light trails' },
    { id: 'electric-purple', hex: '#a255ff', label: 'Laser Purple', descriptor: 'Boosts neon edges' },
    { id: 'electric-orange', hex: '#ff6f3f', label: 'Pulse Orange', descriptor: 'Adds rave heat' },
  ],
  signature: [
    { id: 'signature-plum', hex: '#7f4cd8', label: 'Signature Plum', descriptor: 'Signals premium finish' },
    { id: 'signature-blush', hex: '#f2a9c6', label: 'Blush Gleam', descriptor: 'Softens the glow' },
    { id: 'signature-cream', hex: '#faeadb', label: 'Opal Cream', descriptor: 'Keeps the aura balanced' },
  ],
};

const toneComplementary: ToneComplementaryMap = {
  classic: { premium: 'pastel-bliss', fallback: 'calm-watercolor' },
  trending: { premium: 'pastel-bliss', fallback: 'watercolor-dreams' },
  modern: { premium: 'signature-aurora', fallback: 'pop-art-bust' },
  stylized: { premium: 'pop-surrealism', fallback: '3d-storybook' },
  electric: { premium: 'electric-drip', fallback: 'neon-splash' },
  signature: { premium: 'signature-aurora', fallback: 'pastel-bliss' },
};

const toneShareHooks: Record<Exclude<StyleTone, null>, string> = {
  classic: 'Timeless strokes and warm lighting make this memory feel museum-ready.',
  trending: 'Dreamy washes and light leaks reimagine this moment with modern softness.',
  modern: 'Graphic contrast and clean geometry turn this capture into gallery design.',
  stylized: 'Playful illustration energy brings this storybook vignette to life.',
  electric: 'Neon trails and UV bloom light up this portrait with kinetic energy.',
  signature: 'Wondertone’s signature finish wraps this memory in aurora glow.',
};

export function getNarrative(style: StyleOption): Narrative {
  const registryEntry = STYLE_REGISTRY_BY_ID.get(style.id);
  const narrativeFromRegistry = registryEntry?.story?.narrative ?? null;
  if (narrativeFromRegistry) {
    const headline = narrativeFromRegistry.headline ?? `The story behind ${style.name}`;
    const bullets = narrativeFromRegistry.bullets.map((bullet) => ({
      label: bullet.label,
      value: bullet.value,
      icon: bullet.icon ?? resolveBulletIcon(bullet.label),
    }));
    return {
      headline,
      paragraph: narrativeFromRegistry.paragraph,
      bullets,
    };
  }
  const factory = style.tone ? toneNarratives[style.tone] : undefined;
  return factory ? factory(style.name) : toneNarratives.classic(style.name);
}

export function getPalette(style: StyleOption): PaletteSwatch[] {
  const registryEntry = STYLE_REGISTRY_BY_ID.get(style.id);
  const paletteFromRegistry = registryEntry?.story?.palette;
  if (paletteFromRegistry && paletteFromRegistry.length > 0) {
    return paletteFromRegistry.map((swatch) => ({ ...swatch }));
  }
  if (style.tone) {
    const tonePalette = tonePalettes[style.tone];
    if (tonePalette) return tonePalette;
  }
  return tonePalettes.classic;
}

export function getComplementaryStyles(style: StyleOption): ComplementaryStyles {
  const registryEntry = STYLE_REGISTRY_BY_ID.get(style.id);
  const complementaryFromRegistry = registryEntry?.story?.complementary;
  if (complementaryFromRegistry) {
    return {
      premium:
        complementaryFromRegistry.premium === undefined
          ? null
          : complementaryFromRegistry.premium,
      fallback: complementaryFromRegistry.fallback,
    };
  }
  if (style.tone) {
    const toneFallback = toneComplementary[style.tone];
    if (toneFallback) return toneFallback;
  }
  return toneComplementary.classic;
}

export function getShareCaption({ tone, styleName, tier }: ShareCaptionConfig): string {
  const hook = tone && toneShareHooks[tone] ? toneShareHooks[tone] : toneShareHooks.classic;
  const tierTag = tier === 'free' ? 'Free Preview' : `${tier.charAt(0).toUpperCase()}${tier.slice(1)} Member`;
  return `${hook}\n\nCreated with Wondertone’s ${styleName}. (${tierTag})\n→ wondertone.com/studio`;
}

/**
 * Helper to surface curated copy for the Story Layer.
 * - Top 5 styles have bespoke narratives and palette descriptors.
 * - All other styles fall back to tone-based templates to avoid blocking launch.
 *
 * To add new bespoke copy, update the `story` field inside
 * `registry/styleRegistrySource.ts`. The build script will propagate
 * those values into the generated registry consumed at runtime.
 */
export type { Narrative, PaletteSwatch, ComplementaryStyles };
