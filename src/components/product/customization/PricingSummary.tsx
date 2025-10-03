
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

interface PricingSummaryProps {
  selectedSize: string;
  customizations: CustomizationOptions;
}

const PricingSummary = ({ selectedSize, customizations }: PricingSummaryProps) => {
  const calculateTotalPrice = () => {
    const basePrice = 149; // Base canvas price
    let total = basePrice;
    
    if (customizations.floatingFrame.enabled) total += 79;
    if (customizations.livingMemory) total += 29;
    if (customizations.voiceMatch) total += 19;
    if (customizations.aiUpscale) total += 15;
    
    return {
      basePrice,
      total
    };
  };

  const { basePrice, total } = calculateTotalPrice();
  const savings = total > basePrice ? Math.round((total - basePrice) * 0.2) : 0;

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-gray-900">Your Custom Canvas</span>
          <Badge className="bg-green-500 text-white">
            {savings > 0 ? `Save $${savings}` : 'Premium Quality'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Canvas ({selectedSize})</span>
          <span className="font-semibold">${basePrice}</span>
        </div>
        
        {customizations.floatingFrame.enabled && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Floating Frame</span>
            <span className="font-semibold">+$79</span>
          </div>
        )}
        
        {customizations.livingMemory && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Living Memory</span>
            <span className="font-semibold">+$29</span>
          </div>
        )}
        
        {customizations.voiceMatch && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Voice Match</span>
            <span className="font-semibold">+$19</span>
          </div>
        )}
        
        {customizations.aiUpscale && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">AI Upscale</span>
            <span className="font-semibold">+$15</span>
          </div>
        )}
        
        <div className="border-t pt-4">
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total</span>
            <span className="text-purple-600">${total}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PricingSummary;
