
import type { Config } from "tailwindcss";

export const themeConfig: Config['theme'] = {
  container: {
    center: true,
    padding: '2rem',
    screens: {
      '2xl': '1400px'
    }
  },
  extend: {
    fontFamily: {
      'oswald': ['Oswald', 'sans-serif'],
      'montserrat': ['Montserrat', 'sans-serif'],
      'poppins': ['Poppins', 'sans-serif'],
      'playfair': ['Playfair Display', 'serif'],
      'inter': ['Inter', 'sans-serif'],
    },
    letterSpacing: {
      'extra-tight': '-0.05em',
      'ultra-tight': '-0.075em',
    },
    colors: {
      border: 'hsl(var(--border))',
      input: 'hsl(var(--input))',
      ring: 'hsl(var(--ring))',
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      primary: {
        DEFAULT: 'hsl(var(--primary))',
        foreground: 'hsl(var(--primary-foreground))'
      },
      secondary: {
        DEFAULT: 'hsl(var(--secondary))',
        foreground: 'hsl(var(--secondary-foreground))'
      },
      destructive: {
        DEFAULT: 'hsl(var(--destructive))',
        foreground: 'hsl(var(--destructive-foreground))'
      },
      muted: {
        DEFAULT: 'hsl(var(--muted))',
        foreground: 'hsl(var(--muted-foreground))'
      },
      accent: {
        DEFAULT: 'hsl(var(--accent))',
        foreground: 'hsl(var(--accent-foreground))'
      },
      popover: {
        DEFAULT: 'hsl(var(--popover))',
        foreground: 'hsl(var(--popover-foreground))'
      },
      card: {
        DEFAULT: 'hsl(var(--card))',
        foreground: 'hsl(var(--card-foreground))'
      },
      sidebar: {
        DEFAULT: 'hsl(var(--sidebar-background))',
        foreground: 'hsl(var(--sidebar-foreground))',
        primary: 'hsl(var(--sidebar-primary))',
        'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
        accent: 'hsl(var(--sidebar-accent))',
        'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
        border: 'hsl(var(--sidebar-border))',
        ring: 'hsl(var(--sidebar-ring))'
      }
    },
    borderRadius: {
      lg: 'var(--radius)',
      md: 'calc(var(--radius) - 2px)',
      sm: 'calc(var(--radius) - 4px)'
    },
    boxShadow: {
      'premium': '0 8px 30px rgb(0,0,0,0.12)',
      'premium-hover': '0 20px 60px rgb(0,0,0,0.15)',
      'premium-selected': '0 20px 60px rgb(147,51,234,0.25)',
      'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      'glass-hover': '0 8px 32px 0 rgba(31, 38, 135, 0.5)',
      'holographic': '0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(236, 72, 153, 0.2)'
    },
    backdropBlur: {
      'xs': '2px',
    }
  }
};
