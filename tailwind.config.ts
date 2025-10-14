
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
        scan: {
          '0%': { top: '0%' },
          '100%': { top: '100%' },
        },
        'scan-slow': {
          '0%': { top: '0%' },
          '100%': { top: '100%' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)', opacity: '0' },
          '50%': { opacity: '0.6' },
          '100%': { transform: 'translateY(-100px) translateX(20px)', opacity: '0' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-20px) scale(1.05)' },
        },
        'rotate-slow': {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(180deg) scale(1.1)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s linear infinite',
        confetti: 'confetti 1.2s ease-out forwards',
        pulseGlow: 'pulseGlow 2s ease-in-out infinite',
        scaleIn: 'scaleIn 0.3s ease-out',
        fadeIn: 'fadeIn 0.5s ease-out',
        scan: 'scan 2s linear infinite',
        'scan-slow': 'scan-slow 3s linear infinite',
        'spin-slow': 'spin-slow 3s linear infinite',
        'bounce-subtle': 'bounce-subtle 1.5s ease-in-out infinite',
        float: 'float 5s ease-in-out infinite',
        'float-slow': 'float-slow 8s ease-in-out infinite',
        'rotate-slow': 'rotate-slow 20s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
