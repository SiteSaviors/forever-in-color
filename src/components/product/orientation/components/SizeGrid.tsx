
import GlassMorphismSizeCard from "./GlassMorphismSizeCard";
import { sizeOptions } from "../data/sizeOptions";
import { useCallback } from "react";

interface SizeGridProps {
  selectedOrientation: string;
  selectedSize: string;
  recommendedSize: string;
  onSizeSelect: (size: string) => void;
  onContinueWithSize: (size: string, e: React.MouseEvent) => void;
}

const SizeGrid = ({
  selectedOrientation,
  selectedSize,
  recommendedSize,
  onSizeSelect,
  onContinueWithSize
}: SizeGridProps) => {
  const handleSizeSelect = useCallback((size: string) => {
    onSizeSelect(size);
  }, [onSizeSelect]);

  const handleContinueWithSize = useCallback((size: string, e: React.MouseEvent) => {
    onContinueWithSize(size, e);
  }, [onContinueWithSize]);

  return (
    <div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      data-size-section
      role="radiogroup"
      aria-label="Canvas size options"
    >
      {sizeOptions[selectedOrientation]?.map(option => (
        <div key={option.size} className="transform transition-all duration-200 hover:-translate-y-1">
          <GlassMorphismSizeCard 
            option={option} 
            orientation={selectedOrientation}
            isSelected={selectedSize === option.size} 
            isRecommended={option.size === recommendedSize}
            userImageUrl={null} 
            onClick={() => handleSizeSelect(option.size)} 
            onContinue={e => handleContinueWithSize(option.size, e)} 
          />
        </div>
      ))}
    </div>
  );
};

export default SizeGrid;
