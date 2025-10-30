/**
 * Curated list of hero styles surfaced in the Trending accordion.
 * These reference existing catalog entries; no duplicate registry rows required.
 * Order defines top-to-bottom display priority.
 */
export const TRENDING_HERO_STYLES = [
  'watercolor-dreams', // Signature – soft portrait washes
  'gallery-acrylic', // Classic – bold gallery brushwork
  '3d-storybook', // Stylized – whimsical 3D illustration
  'electric-drip', // Electric – fluorescent neon drips
  'liquid-chrome', // Signature (Creator tier) – mercury sheen
] as const;

export const isTrendingHeroStyle = (styleId: string): boolean =>
  (TRENDING_HERO_STYLES as readonly string[]).includes(styleId);

export type TrendingHeroStyleId = (typeof TRENDING_HERO_STYLES)[number];
