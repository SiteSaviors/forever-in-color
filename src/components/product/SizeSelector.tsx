
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface SizeOption {
  size: string;
  framedPrice: number;
  unframedPrice: number;
  popular: boolean;
}

interface SizeSelectorProps {
  selectedOrientation: string;
  selectedSize: string;
  isFramed: boolean;
  onSizeChange: (size: string) => void;
  sizeOptions: Record<string, SizeOption[]>;
}

const SizeSelector = ({ 
  selectedOrientation, 
  selectedSize, 
  isFramed, 
  onSizeChange, 
  sizeOptions 
}: SizeSelectorProps) => {
  const getCurrentPrice = () => {
    if (!selectedOrientation || !selectedSize) return null;
    
    const orientationKey = selectedOrientation as keyof typeof sizeOptions;
    const sizeData = sizeOptions[orientationKey]?.find(item => item.size === selectedSize);
    
    if (!sizeData) return null;
    
    return isFramed ? sizeData.framedPrice : sizeData.unframedPrice;
  };

  if (!selectedOrientation) return null;

  return (
    <div className="space-y-6">
      <div className="max-w-md mx-auto">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Size & See Price
        </label>
        <Select value={selectedSize} onValueChange={onSizeChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose your canvas size..." />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {sizeOptions[selectedOrientation as keyof typeof sizeOptions]?.map((option) => (
              <SelectItem key={option.size} value={option.size} className="flex justify-between">
                <div className="flex justify-between items-center w-full">
                  <span>{option.size}</span>
                  <div className="flex items-center gap-2 ml-4">
                    {option.popular && (
                      <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                        Popular
                      </span>
                    )}
                    <span className="font-semibold text-purple-600">
                      ${isFramed ? option.framedPrice : option.unframedPrice}
                    </span>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedSize && (
        <div className="max-w-md mx-auto">
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">
                  {selectedSize} • {selectedOrientation} • {isFramed ? 'Framed' : 'Unframed'}
                </p>
                <p className="text-3xl font-bold text-purple-600">
                  ${getCurrentPrice()}
                </p>
              </div>
              <Button 
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                size="lg"
              >
                Add to Cart
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SizeSelector;
