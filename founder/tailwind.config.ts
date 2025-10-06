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
      },
      backgroundImage: {
        'gradient-hero': 'var(--gradient-hero)',
        'gradient-callout': 'var(--gradient-callout)',
        'gradient-card': 'var(--gradient-card)',
      },
      borderRadius: {
        founder: '1.75rem',
      },
    },
  },
  plugins: [],
} satisfies Config;
