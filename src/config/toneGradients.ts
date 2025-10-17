import type { StyleTone } from './styleCatalog';

export type ToneGradientConfig = {
  collapsed: string;
  expanded: string;
  accent: string;
  description: string;
};

/**
 * Tone-specific gradient washes and accent colors
 * Each tone has its own "ambient lighting" that creates atmosphere
 */
export const TONE_GRADIENTS: Record<StyleTone, ToneGradientConfig> = {
  trending: {
    collapsed: 'from-rose-500/8 via-amber-500/6 to-transparent',
    expanded: 'from-rose-500/15 via-amber-500/12 to-orange-500/10',
    accent: '#f59e0b', // Warm amber
    description: 'Warm sunset - magenta to tangerine',
  },
  classic: {
    collapsed: 'from-amber-900/8 via-yellow-800/6 to-transparent',
    expanded: 'from-amber-900/15 via-yellow-800/12 to-amber-700/10',
    accent: '#d97706', // Museum sepia
    description: 'Gallery lighting - sepia to cream',
  },
  modern: {
    collapsed: 'from-blue-500/8 via-purple-500/6 to-transparent',
    expanded: 'from-blue-500/15 via-purple-500/12 to-indigo-500/10',
    accent: '#8b5cf6', // Cool violet
    description: 'Contemporary - blue to purple',
  },
  stylized: {
    collapsed: 'from-pink-500/8 via-fuchsia-500/6 to-transparent',
    expanded: 'from-pink-500/15 via-fuchsia-500/12 to-purple-500/10',
    accent: '#d946ef', // Bold fuchsia
    description: 'Pop art - pink to purple',
  },
  electric: {
    collapsed: 'from-cyan-500/8 via-blue-500/6 to-transparent',
    expanded: 'from-cyan-500/15 via-blue-500/12 to-violet-500/10',
    accent: '#06b6d4', // Neon cyan
    description: 'Neon city - cyan to violet',
  },
  signature: {
    collapsed: 'from-purple-600/8 via-rose-500/6 to-transparent',
    expanded: 'from-purple-600/15 via-rose-500/12 to-pink-500/10',
    accent: '#9333ea', // Luxury purple
    description: 'Aurora premium - purple to rose gold',
  },
};
