
export interface SizePrice {
  size: string;
  basePrice: number;
  popularityBonus?: number;
}

export interface CustomizationPricing {
  floatingFrame: number;
  livingMemory: number;
  voiceMatch: number;
  aiUpscale: number;
  customMessage: number;
}

export const basePricing: { [key: string]: SizePrice } = {
  '8x10': { size: '8" x 10"', basePrice: 89 },
  '11x14': { size: '11" x 14"', basePrice: 129 },
  '12x16': { size: '12" x 16"', basePrice: 149, popularityBonus: 10 },
  '16x20': { size: '16" x 20"', basePrice: 189, popularityBonus: 15 },
  '18x24': { size: '18" x 24"', basePrice: 229 },
  '20x24': { size: '20" x 24"', basePrice: 269 },
  '24x36': { size: '24" x 36"', basePrice: 349 },
  '8x8': { size: '8" x 8"', basePrice: 79 },
  '12x12': { size: '12" x 12"', basePrice: 119 },
  '16x16': { size: '16" x 16"', basePrice: 159, popularityBonus: 12 },
  '20x20': { size: '20" x 20"', basePrice: 199 },
  '24x24': { size: '24" x 24"', basePrice: 279 }
};

export const customizationPricing: CustomizationPricing = {
  floatingFrame: 79,
  livingMemory: 59,
  voiceMatch: 19,
  aiUpscale: 15,
  customMessage: 0
};

export const getBasePrice = (size: string): number => {
  const sizeKey = size.replace(/[^0-9x]/g, '').toLowerCase();
  const pricing = basePricing[sizeKey];
  return pricing ? pricing.basePrice : 149;
};

export const calculateCustomizationTotal = (customizations: {
  floatingFrame: { enabled: boolean; color: string };
  livingMemory: boolean;
  voiceMatch: boolean;
  aiUpscale: boolean;
  customMessage: string;
}): number => {
  let total = 0;
  
  if (customizations.floatingFrame.enabled) {
    total += customizationPricing.floatingFrame;
    if (customizations.floatingFrame.color === 'espresso') {
      total += 10;
    }
  }
  
  if (customizations.livingMemory) {
    total += customizationPricing.livingMemory;
  }
  
  if (customizations.voiceMatch && customizations.livingMemory) {
    total += customizationPricing.voiceMatch;
  }
  
  if (customizations.aiUpscale) {
    total += customizationPricing.aiUpscale;
  }
  
  return total;
};

export const calculateShipping = (subtotal: number): number => {
  return subtotal >= 75 ? 0 : 9.99;
};

export const calculateTotalPrice = (
  size: string,
  customizations: {
    floatingFrame: { enabled: boolean; color: string };
    livingMemory: boolean;
    voiceMatch: boolean;  
    aiUpscale: boolean;
    customMessage: string;
  }
): { basePrice: number; customizationTotal: number; shipping: number; total: number } => {
  const basePrice = getBasePrice(size);
  const customizationTotal = calculateCustomizationTotal(customizations);
  const subtotal = basePrice + customizationTotal;
  const shipping = calculateShipping(subtotal);
  const total = subtotal + shipping;

  return {
    basePrice,
    customizationTotal,
    shipping,
    total
  };
};

export const getPopularSizes = (): string[] => {
  return Object.entries(basePricing)
    .filter(([, pricing]) => pricing.popularityBonus)
    .sort((a, b) => (b[1].popularityBonus || 0) - (a[1].popularityBonus || 0))
    .map(([size]) => size);
};

export const getSizeRecommendation = (orientation: string): string => {
  switch (orientation) {
    case 'horizontal':
      return '18x24';
    case 'vertical':
      return '16x20';
    case 'square':
      return '16x16';
    default:
      return '12x16';
  }
};

export const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`;
};

export const calculateSavings = (originalPrice: number, currentPrice: number): number => {
  return Math.max(0, originalPrice - currentPrice);
};
