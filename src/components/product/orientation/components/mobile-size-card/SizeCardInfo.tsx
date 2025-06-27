
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SizeCardInfoProps {
  size: string;
  orientation: string;
  salePrice: number;
  originalPrice: number;
  isSelected: boolean;
  isRecommended?: boolean;
}

const SizeCardInfo: React.FC<SizeCardInfoProps> = ({
  size,
  orientation,
  salePrice,
  originalPrice,
  isSelected,
  isRecommended
}) => {
  const isMobile = useIsMobile();

  const getOrientationDescription = () => {
    switch (orientation) {
      case 'square': return 'balanced displays';
      case 'horizontal': return 'wide spaces';
      default: return 'tall walls';
    }
  };

  return (
    <>
      {/* Size Information */}
      <div className="text-center space-y-2">
        <h3 className={`
          ${isMobile ? 'text-xl' : 'text-2xl'} font-bold font-poppins tracking-tight
          ${isSelected ? 'text-purple-800' : isRecommended ? 'text-amber-800' : 'text-gray-800'}
        `}>
          {size}
        </h3>
        
        <p className={`
          text-sm font-medium font-poppins
          ${isSelected ? 'text-purple-600' : isRecommended ? 'text-amber-600' : 'text-gray-600'}
        `}>
          Perfect for {getOrientationDescription()}
        </p>
      </div>

      {/* Pricing */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <span className={`
            ${isMobile ? 'text-2xl' : 'text-3xl'} font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent
          `}>
            ${salePrice}
          </span>
          {originalPrice > salePrice && (
            <span className="text-lg text-gray-500 line-through font-poppins">
              ${originalPrice}
            </span>
          )}
        </div>
        
        {originalPrice > salePrice && (
          <div className="bg-green-50 rounded-lg px-3 py-1 border border-green-200">
            <p className="text-sm text-green-700 font-bold font-poppins">
              Save ${originalPrice - salePrice}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default SizeCardInfo;
