
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Sparkles } from "lucide-react";
import { OrientationOption } from "../types";
import { getOrientationIcon } from "../utils/orientationIcons";
import InteractiveCanvasPreview from "./InteractiveCanvasPreview";

interface OrientationCardProps {
  orientation: OrientationOption;
  isSelected: boolean;
  isRecommended?: boolean;
  userImageUrl?: string | null;
  onClick: () => void;
  // Accessibility props
  role?: string;
  'aria-checked'?: boolean;
  'aria-labelledby'?: string;
  tabIndex?: number;
  'data-orientation'?: string;
  className?: string;
}

const OrientationCard = ({ 
  orientation, 
  isSelected, 
  isRecommended = false,
  userImageUrl = null,
  onClick,
  role = "button",
  'aria-checked': ariaChecked,
  'aria-labelledby': ariaLabelledBy,
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

  return (
    <Card 
      className={`
        group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 
        focus-within:ring-2 focus-within:ring-purple-300 focus-within:ring-offset-2
        ${isSelected 
          ? 'ring-2 ring-purple-300 shadow-2xl bg-gradient-to-br from-purple-50/50 to-pink-50/50 border-l-4 border-l-purple-500' 
          : 'shadow-lg hover:shadow-purple-100/50'
        }
        ${className}
      `}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={role}
      aria-checked={ariaChecked}
      aria-labelledby={ariaLabelledBy}
      tabIndex={tabIndex}
      data-orientation={dataOrientation}
    >
      <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Premium Badge */}
        {isRecommended && (
          <div className="flex justify-center">
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 shadow-lg">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Recommended
            </Badge>
          </div>
        )}

        {/* Interactive Canvas Preview */}
        {userImageUrl ? (
          <div className="flex justify-center">
            <div className="w-24 h-24 md:w-32 md:h-32">
              <InteractiveCanvasPreview
                orientation={orientation.id}
                userImageUrl={userImageUrl}
                isSelected={isSelected}
                isRecommended={isRecommended}
                onClick={() => {}} // Prevent nested clicks
              />
            </div>
          </div>
        ) : (
          <div className={`
            flex justify-center p-4 md:p-6 rounded-xl transition-all duration-300 relative
            ${isSelected
              ? 'bg-purple-100 text-purple-600 animate-pulse'
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

        {/* Enhanced Text Content */}
        <div className="text-center space-y-2 md:space-y-3">
          <h5 
            id={`orientation-${orientation.id}-label`}
            className="font-bold text-lg md:text-xl text-gray-900 font-poppins tracking-tight"
          >
            {orientation.name}
          </h5>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
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
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 pointer-events-none"></div>
        )}

        {/* Focus indicator for keyboard navigation */}
        <div className="absolute inset-0 rounded-lg ring-0 ring-purple-300 transition-all duration-200 pointer-events-none group-focus-within:ring-2"></div>
      </CardContent>
    </Card>
  );
};

export default OrientationCard;
