
interface PricingCalculation {
  salePrice: number;
  originalPrice: number;
  hasDiscount: boolean;
  discountPercentage: number;
  savings: number;
}

export const calculatePricing = (salePrice: number, originalPrice: number): PricingCalculation => {
  const hasDiscount = originalPrice > salePrice;
  const discountPercentage = hasDiscount 
    ? Math.round((originalPrice - salePrice) / originalPrice * 100) 
    : 0;
  const savings = hasDiscount ? originalPrice - salePrice : 0;

  return {
    salePrice,
    originalPrice,
    hasDiscount,
    discountPercentage,
    savings
  };
};

export const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`;
};

export const getPriceDisplay = (salePrice: number, originalPrice: number) => {
  const pricing = calculatePricing(salePrice, originalPrice);
  
  return {
    ...pricing,
    salePriceFormatted: formatPrice(pricing.salePrice),
    originalPriceFormatted: formatPrice(pricing.originalPrice),
    savingsFormatted: formatPrice(pricing.savings)
  };
};
