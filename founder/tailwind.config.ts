import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        brand: {
          indigo: 'hsl(var(--brand-indigo))',
          purple: 'hsl(var(--brand-purple))',
          pink: 'hsl(var(--brand-pink))',
          emerald: 'hsl(var(--brand-emerald))',
        },
        slate: {
          950: 'hsl(var(--brand-slate-950))',
        },
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        founder: 'var(--shadow-xl)',
        innerBrand: 'var(--shadow-inner)',
        'glow-purple': 'var(--glow-purple)',
        'glow-blue': 'var(--glow-blue)',
        'glow-soft': 'var(--glow-soft)',
      },
      backgroundImage: {
        'gradient-hero': 'var(--gradient-hero)',
        'gradient-callout': 'var(--gradient-callout)',
        'gradient-card': 'var(--gradient-card)',
        'gradient-upload': 'var(--gradient-upload)',
        'gradient-upload-hover': 'var(--gradient-upload-hover)',
        'gradient-cta': 'var(--gradient-cta)',
        'gradient-cta-hover': 'var(--gradient-cta-hover)',
        'gradient-preview-bg': 'var(--gradient-preview-bg)',
        'dropzone-radial': 'radial-gradient(circle at top, rgba(168, 85, 247, 0.35), transparent 60%)',
      },
      borderRadius: {
        founder: '1.75rem',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        confetti: {
          '0%': { transform: 'translateY(0) rotate(0)' },
          '100%': { transform: 'translateY(200%) rotate(360deg)', opacity: '0' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(168, 85, 247, 0.35)' },
          '50%': { boxShadow: '0 0 0 20px rgba(168, 85, 247, 0)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s linear infinite',
        confetti: 'confetti 1.2s ease-out forwards',
        pulseGlow: 'pulseGlow 2s ease-in-out infinite',
        scaleIn: 'scaleIn 0.3s ease-out',
        fadeIn: 'fadeIn 0.5s ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config;
