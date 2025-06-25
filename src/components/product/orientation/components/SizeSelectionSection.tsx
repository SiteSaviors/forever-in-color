
import GlassMorphismSizeCard from "./GlassMorphismSizeCard";
import SizeHeader from "./SizeHeader";
import { sizeOptions } from "../data/sizeOptions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowDown, DollarSign } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

interface SizeSelectionSectionProps {
  selectedOrientation: string;
  selectedSize: string;
  userImageUrl: string | null;
  onSizeChange: (size: string) => void;
  onContinue?: () => void;
  isUpdating: boolean;
}

const SizeSelectionSection = ({
  selectedOrientation,
  selectedSize,
  userImageUrl,
  onSizeChange,
  onContinue,
  isUpdating
}: SizeSelectionSectionProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const getRecommendedSize = useMemo(() => {
    const recommendations = {
      'square': '16" x 16"',
      'horizontal': '18" x 24"',
      'vertical': '16" x 20"'
    };
    return recommendations[selectedOrientation as keyof typeof recommendations] || '';
  }, [selectedOrientation]);

  const getSizePrice = useCallback((size: string) => {
    switch (size) {
      case "8x10": return 49;
      case "12x16": return 89;
      case "16x20": return 129;
      case "20x24": return 169;
      default: return 49;
    }
  }, []);

  const handleSizeSelect = useCallback((size: string) => {
    if (isUpdating || isProcessing) return;
    
    setIsProcessing(true);
    
    // Debounce the size change to prevent rapid updates
    setTimeout(() => {
      onSizeChange(size);
      setIsProcessing(false);
    }, 100);
  }, [onSizeChange, isUpdating, isProcessing]);
  
  const handleContinueWithSize = useCallback((size: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (isUpdating || isProcessing) return;
    
    setIsProcessing(true);
    onSizeChange(size);
    
    if (onContinue) {
      setTimeout(() => {
        onContinue();
        setIsProcessing(false);
      }, 150);
    } else {
      setIsProcessing(false);
    }
  }, [onSizeChange, onContinue, isUpdating, isProcessing]);

  const recommendedSize = getRecommendedSize;
  const availableSizes = useMemo(() => sizeOptions[selectedOrientation] || [], [selectedOrientation]);

  if (!selectedOrientation) return null;

  return (
    <>
      {/* Smooth transition indicator */}
      <div className="flex justify-center">
        <div className="flex items-center gap-2 text-purple-600 animate-bounce">
          <ArrowDown className="w-4 h-4" />
          <span className="text-sm font-medium">Now choose your size</span>
          <ArrowDown className="w-4 h-4" />
        </div>
      </div>

      <SizeHeader />

      {/* Size Cards Grid with improved performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        {availableSizes.map(option => (
          <div 
            key={option.size} 
            className={`transform transition-transform duration-200 will-change-transform ${
              isProcessing ? 'pointer-events-none' : 'hover:-translate-y-1'
            }`}
          >
            <GlassMorphismSizeCard 
              option={option} 
              orientation={selectedOrientation}
              isSelected={selectedSize === option.size} 
              isRecommended={option.size === recommendedSize}
              userImageUrl={userImageUrl} 
              onClick={() => handleSizeSelect(option.size)} 
              onContinue={e => handleContinueWithSize(option.size, e)} 
              disabled={isProcessing || isUpdating}
            />
          </div>
        ))}
      </div>

      {/* Real-time Price Update */}
      {selectedSize && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-green-700">
            <DollarSign className="w-5 h-5" />
            <span className="text-lg font-semibold">
              Starting at ${getSizePrice(selectedSize)} for {selectedSize} canvas
            </span>
          </div>
          <p className="text-sm text-green-600 mt-1">
            Final price will be calculated with your customizations
          </p>
        </div>
      )}
    </>
  );
};

export default SizeSelectionSection;
