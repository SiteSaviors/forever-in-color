/**
 * Social Proof Content Configuration
 *
 * Phase 1 provides typed placeholder data so the section can render statically
 * before real assets arrive. Content teams will replace these entries during
 * Phase 0 handoff.
 *
 * IMPORTANT: Runtime sanity checks are limited to development mode to avoid
 * crashing production builds. When adding new testimonials or modifying ratios,
 * ensure these checks continue to pass locally.
 */

export type ProductKind = 'digital' | 'canvas' | 'hybrid';

export type HeroStat = {
  id: string;
  value: string;
  label: string;
  description: string;
};

export type PressLogo = {
  id: string;
  name: string;
  /** Logo path relative to public/ or external URL */
  logoSrc: string;
  alt: string;
  href?: string;
};

export type SpotlightStory = {
  id: string;
  title: string;
  quote: string;
  metric?: string;
  author: string;
  product: ProductKind;
  beforeImage: string;
  afterImage: string;
};

const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><rect width="600" height="600" fill="%231f2937"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-family="Arial" font-size="28">Wondertone Placeholder</text></svg>';

export const HERO_STATS: ReadonlyArray<HeroStat> = [
  {
    id: 'stat-previews',
    value: '2.3M+',
    label: 'Previews generated',
    description: 'Creators used Wondertone to explore over 2.3 million art previews.',
  },
  {
    id: 'stat-recommend',
    value: '96%',
    label: 'Recommend Wondertone',
    description: 'Creator members who would recommend Wondertone to a friend.',
  },
  {
    id: 'stat-canvases',
    value: '12K',
    label: 'Canvases shipped',
    description: 'Premium gallery canvases delivered globally in the last 12 months.',
  },
] as const;

export type SpotlightAnalyticsPayload = {
  id: SpotlightStory['id'];
  product: SpotlightStory['product'];
  interaction: 'auto' | 'manual';
};

export const PRESS_LOGOS: ReadonlyArray<PressLogo> = [
  {
    id: 'press-techcrunch',
    name: 'TechCrunch',
    logoSrc: '/press/techcrunch.svg',
    alt: 'TechCrunch logo',
    href: '#',
  },
  {
    id: 'press-wired',
    name: 'Wired',
    logoSrc: '/press/wired.svg',
    alt: 'Wired logo',
    href: '#',
  },
  {
    id: 'press-product-hunt',
    name: 'Product Hunt',
    logoSrc: '/press/product-hunt.svg',
    alt: 'Product Hunt logo',
    href: '#',
  },
  {
    id: 'press-fast-company',
    name: 'Fast Company',
    logoSrc: '/press/fast-company.svg',
    alt: 'Fast Company logo',
    href: '#',
  },
] as const;

export const SPOTLIGHTS: ReadonlyArray<SpotlightStory> = [
  {
    id: 'spotlight-creator-engagement',
    title: 'Creator Spotlight',
    quote: '“Wondertone gave my feed a premium polish overnight.”',
    metric: '+320% engagement in 30 days',
    author: 'Sarah M.',
    product: 'digital',
    beforeImage: PLACEHOLDER_IMAGE,
    afterImage: PLACEHOLDER_IMAGE,
  },
  {
    id: 'spotlight-portfolio',
    title: 'Portfolio Ready',
    quote: '“Clients finally see my vision—every export arrives watermark-free.”',
    metric: '18 styles delivered per shoot',
    author: 'Alex T.',
    product: 'digital',
    beforeImage: PLACEHOLDER_IMAGE,
    afterImage: PLACEHOLDER_IMAGE,
  },
  {
    id: 'spotlight-canvas',
    title: 'From Feed to Frame',
    quote: '“The canvas looks like a gallery piece and arrived in five days.”',
    metric: '3 framed prints for the studio',
    author: 'Jamie L.',
    product: 'canvas',
    beforeImage: PLACEHOLDER_IMAGE,
    afterImage: PLACEHOLDER_IMAGE,
  },
] as const;

const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV;

if (isDev) {
  const digitalCount = SPOTLIGHTS.filter((story) => story.product === 'digital').length;
  const canvasCount = SPOTLIGHTS.filter((story) => story.product === 'canvas').length;

  if (digitalCount < 2) {
    console.warn('[SocialProof] Expected at least two digital spotlights for subscription emphasis.');
  }
  if (canvasCount < 1) {
    console.warn('[SocialProof] Expected at least one canvas spotlight to maintain dual narrative.');
  }
}
