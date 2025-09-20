
interface CustomizationOptions {
  floatingFrame: {
    enabled: boolean;
    color: 'white' | 'black' | 'espresso';
  };
  livingMemory: boolean;
  voiceMatch: boolean;
  customMessage: string;
  aiUpscale: boolean;
}

interface PricingCalculatorProps {
  selectedSize: string;
  selectedOrientation: string;
  customizations: CustomizationOptions;
}

export const usePricingCalculator = ({
  selectedSize,
  selectedOrientation,
  customizations
}: PricingCalculatorProps) => {
  const calculateBasePrice = () => {
    if (!selectedSize || !selectedOrientation) return 0;

    const sizeOptions: Record<string, Record<string, number>> = {
      horizontal: {
        '16" x 12"': 99.99,
        '24" x 18"': 149.99,
        '36" x 24"': 199.99,
        '40" x 30"': 269.99,
        '48" x 32"': 349.99,
        '60" x 40"': 499.99,
      },
      vertical: {
        '12" x 16"': 99.99,
        '18" x 24"': 149.99,
        '24" x 36"': 199.99,
        '30" x 40"': 269.99,
        '32" x 48"': 349.99,
        '40" x 60"': 499.99,
      },
      square: {
        '16" x 16"': 99.99,
        '24" x 24"': 149.99,
        '32" x 32"': 199.99,
        '36" x 36"': 269.99,
      }
    };

    return sizeOptions[selectedOrientation]?.[selectedSize] || 0;
  };

  const calculateCustomizationPrice = () => {
    let total = 0;
    if (customizations.floatingFrame.enabled) total += 29.99;
    if (customizations.livingMemory) total += 59.99;
    if (customizations.voiceMatch && customizations.livingMemory) total += 19.99;
    if (customizations.aiUpscale) total += 9.99;
    return total;
  };

  const basePrice = calculateBasePrice();
  const customizationPrice = calculateCustomizationPrice();
  const totalPrice = basePrice + customizationPrice;
  const savings = customizationPrice > 50 ? 25 : 0;

  return {
    basePrice,
    customizationPrice,
    totalPrice,
    savings
  };
};
