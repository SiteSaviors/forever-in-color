
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

interface PaymentItem {
  name: string;
  description: string;
  amount: number;
  quantity: number;
}

interface PaymentItemsBuilderProps {
  selectedSize: string;
  selectedStyle?: {id: number, name: string} | null;
  customizations: CustomizationOptions;
}

export const buildPaymentItems = ({
  selectedSize,
  selectedStyle,
  customizations
}: PaymentItemsBuilderProps): PaymentItem[] => {
  const items: PaymentItem[] = [];
  
  const getSizePriceInCents = (size: string) => {
    const priceMap: Record<string, number> = {
      '16" x 16"': 9999, '24" x 24"': 14999, '32" x 32"': 19999, '36" x 36"': 26999,
      '16" x 12"': 9999, '24" x 18"': 14999, '36" x 24"': 19999, '40" x 30"': 26999,
      '48" x 32"': 34999, '60" x 40"': 49999, '12" x 16"': 9999, '18" x 24"': 14999,
      '24" x 36"': 19999, '30" x 40"': 26999, '32" x 48"': 34999, '40" x 60"': 49999,
    };
    return priceMap[size] || 9999;
  };

  const basePriceInCents = getSizePriceInCents(selectedSize);
  items.push({
    name: `${selectedStyle?.name || 'Custom'} Canvas`,
    description: `${selectedSize} canvas with ${selectedStyle?.name || 'custom'} style`,
    amount: basePriceInCents,
    quantity: 1
  });

  if (customizations.floatingFrame.enabled) {
    items.push({
      name: 'Floating Frame',
      description: `${customizations.floatingFrame.color} floating frame`,
      amount: 2999,
      quantity: 1
    });
  }

  if (customizations.livingMemory) {
    items.push({
      name: 'Living Memory AR',
      description: 'Augmented reality video activation',
      amount: 5999,
      quantity: 1
    });
  }

  if (customizations.voiceMatch && customizations.livingMemory) {
    items.push({
      name: 'Voice Match',
      description: 'Custom voice narration for AR experience',
      amount: 1999,
      quantity: 1
    });
  }

  if (customizations.aiUpscale) {
    items.push({
      name: 'AI Upscale',
      description: 'Enhanced image resolution',
      amount: 999,
      quantity: 1
    });
  }

  return items;
};
