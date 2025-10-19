import type { StyleTone } from './styleCatalog';

export type ToneGradientConfig = {
  accent: string;
  description: string;
  highlight: string;
  keyline: string;
  ambient: {
    from: string;
    via: string;
    to: string;
  };
  iconStroke: string;
  panel: {
    collapsed: string;
    expanded: string;
  };
};

/**
 * Tone-specific gradient washes and accent colors
 * Each tone has its own "ambient lighting" that creates atmosphere
 */
export const TONE_GRADIENTS: Record<StyleTone, ToneGradientConfig> = {
  trending: {
    accent: '#f59e0b', // Warm amber
    description: 'Warm sunset - magenta to tangerine',
    highlight: 'rgba(245, 158, 11, 0.25)',
    keyline: 'rgba(245, 158, 11, 0.45)',
    ambient: {
      from: 'rgba(251, 191, 36, 0.18)',
      via: 'rgba(236, 72, 153, 0.12)',
      to: 'rgba(244, 114, 182, 0.08)',
    },
    iconStroke: 'rgba(252, 211, 77, 0.9)',
    panel: {
      collapsed:
        'linear-gradient(140deg, rgba(255,109,173,0.82) 0%, rgba(255,142,82,0.78) 38%, rgba(30,19,56,0.92) 100%)',
      expanded:
        'linear-gradient(140deg, rgba(255,126,188,0.9) 0%, rgba(255,169,100,0.85) 42%, rgba(30,19,56,0.88) 100%)',
    },
  },
  classic: {
    accent: '#d97706', // Museum sepia
    description: 'Gallery lighting - sepia to cream',
    highlight: 'rgba(217, 119, 6, 0.28)',
    keyline: 'rgba(250, 204, 21, 0.45)',
    ambient: {
      from: 'rgba(217, 119, 6, 0.16)',
      via: 'rgba(251, 191, 36, 0.12)',
      to: 'rgba(250, 204, 21, 0.08)',
    },
    iconStroke: 'rgba(250, 204, 21, 0.85)',
    panel: {
      collapsed:
        'linear-gradient(135deg, rgba(244,234,210,0.88) 0%, rgba(209,168,102,0.76) 45%, rgba(40,26,12,0.9) 100%)',
      expanded:
        'linear-gradient(135deg, rgba(247,239,219,0.92) 0%, rgba(227,191,132,0.78) 42%, rgba(43,30,15,0.88) 100%)',
    },
  },
  modern: {
    accent: '#22c55e', // Verdant modern green
    description: 'Fresh, design-forward looks for contemporary art lovers.',
    highlight: 'rgba(34, 197, 94, 0.28)',
    keyline: 'rgba(110, 231, 183, 0.5)',
    ambient: {
      from: 'rgba(34, 197, 94, 0.18)',
      via: 'rgba(52, 211, 153, 0.14)',
      to: 'rgba(16, 185, 129, 0.12)',
    },
    iconStroke: 'rgba(167, 243, 208, 0.92)',
    panel: {
      collapsed:
        'linear-gradient(135deg, rgba(148, 255, 187, 0.82) 0%, rgba(34, 197, 94, 0.78) 45%, rgba(12, 48, 34, 0.94) 100%)',
      expanded:
        'linear-gradient(135deg, rgba(167, 255, 199, 0.9) 0%, rgba(52, 211, 153, 0.84) 44%, rgba(12, 48, 34, 0.9) 100%)',
    },
  },
  abstract: {
    accent: '#00B3B8', // Teal-mint
    description: 'Geometric abstraction - teal to mint',
    highlight: 'rgba(0, 179, 184, 0.28)',
    keyline: 'rgba(64, 196, 200, 0.5)',
    ambient: {
      from: 'rgba(0, 179, 184, 0.18)',
      via: 'rgba(0, 149, 154, 0.14)',
      to: 'rgba(0, 122, 126, 0.12)',
    },
    iconStroke: 'rgba(167, 243, 252, 0.9)',
    panel: {
      collapsed:
        'linear-gradient(135deg, rgba(0, 179, 184, 0.82) 0%, rgba(0, 122, 126, 0.78) 45%, rgba(12, 40, 42, 0.94) 100%)',
      expanded:
        'linear-gradient(135deg, rgba(64, 196, 200, 0.9) 0%, rgba(0, 149, 154, 0.84) 44%, rgba(12, 40, 42, 0.9) 100%)',
    },
  },
  stylized: {
    accent: '#d946ef', // Bold fuchsia
    description: 'Pop art - pink to purple',
    highlight: 'rgba(217, 70, 239, 0.24)',
    keyline: 'rgba(244, 114, 182, 0.45)',
    ambient: {
      from: 'rgba(236, 72, 153, 0.16)',
      via: 'rgba(217, 70, 239, 0.13)',
      to: 'rgba(192, 38, 211, 0.1)',
    },
    iconStroke: 'rgba(249, 168, 212, 0.9)',
    panel: {
      collapsed:
        'linear-gradient(135deg, rgba(244,153,255,0.78) 0%, rgba(160,82,255,0.74) 40%, rgba(39,16,58,0.9) 100%)',
      expanded:
        'linear-gradient(135deg, rgba(250,173,255,0.86) 0%, rgba(187,110,255,0.8) 42%, rgba(39,16,58,0.88) 100%)',
    },
  },
  electric: {
    accent: '#06b6d4', // Neon cyan
    description: 'Neon city - cyan to violet',
    highlight: 'rgba(6, 182, 212, 0.24)',
    keyline: 'rgba(56, 189, 248, 0.45)',
    ambient: {
      from: 'rgba(45, 212, 191, 0.16)',
      via: 'rgba(14, 165, 233, 0.13)',
      to: 'rgba(59, 130, 246, 0.12)',
    },
    iconStroke: 'rgba(165, 243, 252, 0.9)',
    panel: {
      collapsed:
        'linear-gradient(135deg, rgba(64,226,255,0.8) 0%, rgba(126,111,255,0.76) 42%, rgba(18,28,63,0.92) 100%)',
      expanded:
        'linear-gradient(135deg, rgba(94,236,255,0.88) 0%, rgba(149,135,255,0.82) 44%, rgba(18,28,63,0.9) 100%)',
    },
  },
  signature: {
    accent: '#9333ea', // Luxury purple
    description: 'Aurora premium - purple to rose gold',
    highlight: 'rgba(147, 51, 234, 0.28)',
    keyline: 'rgba(251, 191, 36, 0.5)',
    ambient: {
      from: 'rgba(147, 51, 234, 0.2)',
      via: 'rgba(244, 114, 182, 0.14)',
      to: 'rgba(251, 191, 36, 0.12)',
    },
    iconStroke: 'rgba(253, 224, 71, 0.9)',
    panel: {
      collapsed:
        'linear-gradient(135deg, rgba(189,128,255,0.82) 0%, rgba(255,178,167,0.75) 42%, rgba(41,12,62,0.94) 100%)',
      expanded:
        'linear-gradient(135deg, rgba(205,146,255,0.9) 0%, rgba(255,197,184,0.82) 44%, rgba(41,12,62,0.9) 100%)',
    },
  },
};
