
export const animationsConfig = {
  keyframes: {
    'accordion-down': {
      from: {
        height: '0'
      },
      to: {
        height: 'var(--radix-accordion-content-height)'
      }
    },
    'accordion-up': {
      from: {
        height: 'var(--radix-accordion-content-height)'
      },
      to: {
        height: '0'
      }
    },
    'glow-pulse': {
      '0%, 100%': {
        boxShadow: '0 0 5px rgba(168, 85, 247, 0.4)'
      },
      '50%': {
        boxShadow: '0 0 20px rgba(168, 85, 247, 0.6), 0 0 30px rgba(168, 85, 247, 0.4)'
      }
    },
    'slide-in': {
      '0%': {
        transform: 'translateX(-10px)',
        opacity: '0'
      },
      '100%': {
        transform: 'translateX(0)',
        opacity: '1'
      }
    },
    'float': {
      '0%, 100%': {
        transform: 'translateY(0px)'
      },
      '50%': {
        transform: 'translateY(-2px)'
      }
    },
    'premium-hover': {
      '0%': {
        transform: 'scale(1) translateY(0px)',
        boxShadow: '0 8px 30px rgb(0,0,0,0.12)'
      },
      '100%': {
        transform: 'scale(1.02) translateY(-4px)',
        boxShadow: '0 20px 60px rgb(0,0,0,0.15)'
      }
    },
    'glass-shimmer': {
      '0%': {
        transform: 'translateX(-100%) skewX(-12deg)',
        opacity: '0'
      },
      '50%': {
        opacity: '1'
      },
      '100%': {
        transform: 'translateX(200%) skewX(-12deg)',
        opacity: '0'
      }
    },
    'morph-scale': {
      '0%': {
        transform: 'scale(1)',
        filter: 'blur(0px)'
      },
      '50%': {
        transform: 'scale(0.95)',
        filter: 'blur(1px)'
      },
      '100%': {
        transform: 'scale(1)',
        filter: 'blur(0px)'
      }
    },
    'holographic-border': {
      '0%': {
        background: 'linear-gradient(45deg, #8b5cf6, #ec4899, #8b5cf6)'
      },
      '50%': {
        background: 'linear-gradient(45deg, #ec4899, #8b5cf6, #ec4899)'
      },
      '100%': {
        background: 'linear-gradient(45deg, #8b5cf6, #ec4899, #8b5cf6)'
      }
    },
    'floating-particles': {
      '0%': {
        transform: 'translateY(0px) rotate(0deg)',
        opacity: '0'
      },
      '50%': {
        transform: 'translateY(-20px) rotate(180deg)',
        opacity: '1'
      },
      '100%': {
        transform: 'translateY(-40px) rotate(360deg)',
        opacity: '0'
      }
    },
    'texture-flow': {
      '0%': {
        backgroundPosition: '0% 0%'
      },
      '100%': {
        backgroundPosition: '100% 100%'
      }
    },
    'confidence-build': {
      '0%': {
        transform: 'scale(0.98)',
        opacity: '0.8'
      },
      '50%': {
        transform: 'scale(1.01)',
        opacity: '0.9'
      },
      '100%': {
        transform: 'scale(1)',
        opacity: '1'
      }
    },
    'selection-celebrate': {
      '0%': {
        transform: 'scale(1)',
      },
      '50%': {
        transform: 'scale(1.05)',
      },
      '100%': {
        transform: 'scale(1.02)',
      }
    },
    'fade-in': {
      '0%': {
        opacity: '0',
        transform: 'translateY(10px)'
      },
      '100%': {
        opacity: '1',
        transform: 'translateY(0)'
      }
    }
  },
  animation: {
    'accordion-down': 'accordion-down 0.2s ease-out',
    'accordion-up': 'accordion-up 0.2s ease-out',
    'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
    'slide-in': 'slide-in 0.3s ease-out',
    'float': 'float 3s ease-in-out infinite',
    'premium-hover': 'premium-hover 0.3s ease-out forwards',
    'glass-shimmer': 'glass-shimmer 2s ease-in-out infinite',
    'morph-scale': 'morph-scale 0.3s ease-in-out',
    'holographic-border': 'holographic-border 3s ease-in-out infinite',
    'floating-particles': 'floating-particles 4s ease-in-out infinite',
    'texture-flow': 'texture-flow 8s linear infinite',
    'confidence-build': 'confidence-build 0.6s ease-out',
    'selection-celebrate': 'selection-celebrate 0.4s ease-out',
    'fade-in': 'fade-in 0.3s ease-out'
  }
};
