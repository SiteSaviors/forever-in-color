
export const utilitiesConfig = {
  // Custom utility classes and component styles
  '.touch-manipulation': {
    'touch-action': 'manipulation'
  },
  '.no-tap-highlight': {
    '-webkit-tap-highlight-color': 'transparent'
  },
  '.prevent-zoom': {
    'touch-action': 'pan-x pan-y'
  },
  '.safe-area-inset-top': {
    'padding-top': 'env(safe-area-inset-top)'
  },
  '.safe-area-inset-bottom': {
    'padding-bottom': 'env(safe-area-inset-bottom)'
  },
  '.scroll-smooth-mobile': {
    'scroll-behavior': 'smooth',
    '-webkit-overflow-scrolling': 'touch'
  },
  '.mobile-grid': {
    '@apply': 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'
  },
  '.mobile-card': {
    '@apply': 'rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 touch-manipulation'
  },
  '.mobile-input': {
    '@apply': 'min-h-[44px] px-4 py-3 text-base rounded-lg border-2 focus:ring-2 focus:ring-offset-2 transition-all duration-200'
  },
  '.font-poppins': {
    'font-family': 'Poppins, sans-serif',
    'letter-spacing': '-0.05em'
  },
  '.font-poppins-tight': {
    'font-family': 'Poppins, sans-serif',
    'letter-spacing': '-0.075em'
  }
};
