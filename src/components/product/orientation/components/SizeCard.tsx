
import { SizeOption } from "../types";
import { getCanvasPreview } from "../utils/canvasPreview";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface SizeCardProps {
  option: SizeOption;
  orientation: string;
  isSelected: boolean;
  onClick: () => void;
  onContinue: (e: React.MouseEvent) => void;
}

const SizeCard = ({ option, orientation, isSelected, onClick, onContinue }: SizeCardProps) => {
  return (
    <div
      className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'border-purple-500 bg-purple-50 shadow-lg scale-105'
          : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
      }`}
      onClick={onClick}
    >
      {/* Popular Badge */}
      {option.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
            Most Popular
          </span>
        </div>
      )}

      {/* Canvas Preview */}
      <div className="mb-4">
        {getCanvasPreview(orientation, option.size)}
      </div>

      {/* Size Info */}
      <div className="text-center">
        <h5 className="font-semibold text-gray-900 mb-1">{option.size}</h5>
        <p className="text-sm text-gray-600 mb-2">{option.description}</p>
        <p className="text-xs text-gray-500 mb-3">{option.category}</p>
        
        {/* Pricing */}
        <div className="mb-4">
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg font-bold text-purple-600">${option.salePrice}</span>
            {option.originalPrice > option.salePrice && (
              <span className="text-sm text-gray-500 line-through">${option.originalPrice}</span>
            )}
          </div>
          {option.originalPrice > option.salePrice && (
            <p className="text-xs text-green-600 font-medium">
              Save ${option.originalPrice - option.salePrice}
            </p>
          )}
        </div>

        {/* Continue Button - Only show when selected */}
        {isSelected && (
          <Button
            onClick={onContinue}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            size="sm"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default SizeCard;
