
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Crown, ArrowRight } from "lucide-react";
import { SizeOption } from "../types/interfaces";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { MockupCanvas } from "../../MockupCanvas";

interface GlassMorphismSizeCardProps {
  option: SizeOption;
  orientation: string;
  isSelected: boolean;
  userImageUrl: string | null;
  isRecommended?: boolean;
  disabled?: boolean;
  onClick: () => void;
  onContinue: (e?: React.MouseEvent) => void;
  // Accessibility props
  role?: string;
  'aria-checked'?: boolean;
  'aria-labelledby'?: string;
  tabIndex?: number;
  'data-size'?: string;
  className?: string;
}

const GlassMorphismSizeCard = ({
  option,
  orientation,
  isSelected,
  userImageUrl,
  isRecommended = false,
  disabled = false,
  onClick,
  onContinue,
  role = "button",
  'aria-checked': ariaChecked,
  'aria-labelledby': ariaLabelledBy,
  tabIndex = 0,
  'data-size': dataSize,
  className = ""
}: GlassMorphismSizeCardProps) => {
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  const handleContinueClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onContinue(e);
  };

  // Get aspect ratio for canvas preview
  const getAspectRatio = () => {
    switch (orientation) {
      case 'horizontal': return 4/3;
      case 'vertical': return 3/4;
      case 'square': return 1;
      default: return 1;
    }
  };

  return (
    <Card 
      className={`
        group relative overflow-hidden transition-all duration-300 cursor-pointer
        hover:shadow-2xl hover:-translate-y-2 transform-gpu
        focus-within:ring-2 focus-within:ring-purple-300 focus-within:ring-offset-2
        ${isSelected 
          ? 'ring-2 ring-purple-400 shadow-2xl bg-gradient-to-br from-purple-50 via-white to-pink-50' 
          : 'shadow-lg hover:shadow-purple-100/50 bg-white'
        }
        ${disabled ? 'opacity-60 pointer-events-none' : ''}
        ${className}
      `}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={role}
      aria-checked={ariaChecked}
      aria-labelledby={ariaLabelledBy}
      tabIndex={tabIndex}
      data-size={dataSize}
    >
      <CardContent className="p-4 md:p-6 space-y-4 relative z-10">
        {/* Premium badges */}
        <div className="flex justify-between items-start mb-3">
          {option.popular && (
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
              <Crown className="w-3 h-3 mr-1" />
              Most Popular
            </Badge>
          )}
          {isRecommended && (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg">
              Recommended
            </Badge>
          )}
        </div>

        {/* Canvas Preview with User Image */}
        <div className="mb-4">
          <AspectRatio ratio={getAspectRatio()} className="relative overflow-hidden rounded-lg">
            {userImageUrl ? (
              <MockupCanvas 
                previewUrl={userImageUrl}
                orientation={orientation as 'square' | 'horizontal' | 'vertical'}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-xs font-medium mb-1">{option.size}</div>
                  <div className="text-xs opacity-75">{orientation}</div>
                </div>
              </div>
            )}
          </AspectRatio>
        </div>

        {/* Size Info */}
        <div className="text-center space-y-2">
          <h4 
            id={`size-${option.size}-label`}
            className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight"
          >
            {option.size}
          </h4>
          <p className="text-sm text-gray-600 font-medium">
            {option.category}
          </p>
          <p className="text-xs text-gray-500 leading-relaxed">
            {option.description}
          </p>
        </div>

        {/* Pricing */}
        <div className="text-center py-2">
          <div className="space-y-1">
            <p className="text-2xl md:text-3xl font-bold text-purple-600">
              ${option.salePrice}
            </p>
            {option.originalPrice > option.salePrice && (
              <p className="text-lg text-gray-400 line-through">
                ${option.originalPrice}
              </p>
            )}
          </div>
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <div className="flex items-center justify-center gap-2 text-purple-600 font-medium">
            <CheckCircle className="w-5 h-5" />
            <span>Selected Size</span>
          </div>
        )}

        {/* Continue button for selected items */}
        {isSelected && (
          <Button
            onClick={handleContinueClick}
            className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 min-h-[48px] touch-manipulation"
            size="lg"
          >
            Continue with {option.size}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}

        {/* Glass morphism background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent backdrop-blur-sm pointer-events-none"></div>
        
        {/* Selection glow effect */}
        {isSelected && (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 pointer-events-none"></div>
        )}

        {/* Focus indicator for keyboard navigation */}
        <div className="absolute inset-0 rounded-lg ring-0 ring-purple-300 transition-all duration-200 pointer-events-none group-focus-within:ring-2"></div>
      </CardContent>
    </Card>
  );
};

export default GlassMorphismSizeCard;
