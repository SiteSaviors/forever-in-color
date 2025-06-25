
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Sparkles } from "lucide-react";
import { OrientationOption } from "../types/interfaces";
import { getOrientationIcon } from "../utils/orientationIcons";
import InteractiveCanvasPreview from "./InteractiveCanvasPreview";
import { TouchInteractionProps, OrientationCardProps } from "../types/interfaces";

const OrientationCard = ({ 
  orientation, 
  isSelected, 
  isRecommended = false,
  userImageUrl = null,
  onClick,
  role = "radio",
  'aria-checked': ariaChecked,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-disabled': ariaDisabled,
  tabIndex = 0,
  'data-orientation': dataOrientation,
  className = ""
}: OrientationCardProps) => {
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  // Enhanced touch handling for mobile with proper typing
  const handleTouchStart = (e: React.TouchEvent) => {
    const element = e.currentTarget as HTMLElement;
    element.style.transform = 'scale(0.98)';
    element.style.transition = 'transform 0.1s ease';
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const element = e.currentTarget as HTMLElement;
    element.style.transform = isSelected ? 'scale(1.02)' : 'scale(1)';
    element.style.transition = 'transform 0.2s ease';
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  };

  return (
    <Card 
      className={`
        group cursor-pointer transition-all duration-300 
        hover:shadow-xl hover:-translate-y-1 
        focus-within:ring-2 focus-within:ring-purple-300 focus-within:ring-offset-2
        active:scale-98
        ${isSelected 
          ? 'ring-2 ring-purple-400 shadow-xl bg-gradient-to-br from-purple-50/80 to-pink-50/80 border-l-4 border-l-purple-500 scale-102' 
          : 'shadow-md hover:shadow-purple-100/50'
        }
        ${className}
        min-h-[200px] md:min-h-[240px]
        touch-manipulation
        select-none
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role={role}
      aria-checked={ariaChecked}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      aria-disabled={ariaDisabled}
      tabIndex={tabIndex}
      data-orientation={dataOrientation}
    >
      <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6 h-full flex flex-col justify-between">
        {/* Premium Badge */}
        {isRecommended && (
          <div className="flex justify-center">
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 shadow-lg text-sm">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Recommended
            </Badge>
          </div>
        )}

        {/* Interactive Canvas Preview */}
        <div className="flex-1 flex items-center justify-center">
          {userImageUrl ? (
            <div className="w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32">
              <InteractiveCanvasPreview
                orientation={orientation.id}
                userImageUrl={userImageUrl}
                isSelected={isSelected}
                isRecommended={isRecommended}
                onClick={() => {}} // Prevent nested clicks
              />
            </div>
          ) : (
            <div className={`
              flex justify-center items-center p-6 md:p-8 rounded-xl transition-all duration-300 relative
              w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32
              ${isSelected
                ? 'bg-purple-100 text-purple-600'
                : 'bg-gray-100 text-gray-500 group-hover:bg-purple-50 group-hover:text-purple-400'
              }
            `}>
              {getOrientationIcon(orientation.id)}
              {isSelected && (
                <div className="absolute -top-2 -right-2">
                  <Badge className="bg-purple-500 text-white">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Selected
                  </Badge>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Enhanced Text Content */}
        <div className="text-center space-y-2 md:space-y-3">
          <h5 
            id={`orientation-${orientation.id}-label`}
            className="font-bold text-lg md:text-xl text-gray-900 font-poppins tracking-tight"
          >
            {orientation.name}
          </h5>
          <p 
            id={`orientation-${orientation.id}-description`}
            className="text-gray-600 text-sm md:text-base leading-relaxed"
          >
            {orientation.description}
          </p>
          {isSelected && (
            <p className="text-sm text-purple-600 font-medium flex items-center justify-center gap-1">
              <CheckCircle className="w-4 h-4" />
              Perfect choice for your image
            </p>
          )}
        </div>

        {/* Premium Selection Effect */}
        {isSelected && (
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-purple-500/5 pointer-events-none"></div>
        )}

        {/* Touch-friendly tap area indicator */}
        <div className="absolute inset-0 rounded-lg transition-all duration-200 pointer-events-none group-active:bg-purple-500/10"></div>
      </CardContent>
    </Card>
  );
};

export default OrientationCard;
