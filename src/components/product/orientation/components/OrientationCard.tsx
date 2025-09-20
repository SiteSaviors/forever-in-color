
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
}

// Haptic feedback utility
const triggerHapticFeedback = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate(50);
  }
};

const OrientationCard = ({ 
  orientation, 
  isSelected, 
  isRecommended = false,
  userImageUrl = null,
  onClick 
}: OrientationCardProps) => {
  
  const handleClick = () => {
    triggerHapticFeedback();
    onClick();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerHapticFeedback();
      onClick();
    }
  };

  const getCardState = () => {
    if (isSelected) return "selected";
    if (isRecommended) return "recommended";
    return "default";
  };

  const cardState = getCardState();

  return (
    <Card 
      className={`
        group cursor-pointer transition-all duration-500 ease-out min-h-[320px] touch-manipulation transform-gpu relative overflow-hidden
        ${cardState === "selected"
          ? 'ring-4 ring-purple-400/70 shadow-2xl bg-gradient-to-br from-purple-50/80 to-pink-50/60 border-2 border-purple-300 scale-[1.03] -translate-y-2 animate-pulse' 
          : cardState === "recommended"
          ? 'ring-2 ring-amber-300/60 shadow-xl hover:shadow-2xl border border-amber-200 bg-gradient-to-br from-amber-50/60 to-orange-50/40 hover:scale-[1.02] hover:-translate-y-1'
          : 'shadow-lg hover:shadow-2xl border border-gray-200 hover:border-purple-200 bg-white hover:scale-[1.02] hover:-translate-y-1'
        }
      `}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`Select ${orientation.name} orientation`}
      onKeyDown={handleKeyDown}
    >
      <CardContent className="p-6 md:p-8 space-y-6 h-full flex flex-col justify-between relative">
        {/* Recommended badge with animation */}
        {isRecommended && !isSelected && (
          <div className="absolute -top-2 -right-2 z-20">
            <Badge className="bg-gradient-to-r from-amber-400 to-orange-400 text-white px-3 py-1 rounded-full shadow-lg animate-bounce text-xs font-bold">
              <Sparkles className="w-3 h-3 mr-1" />
              Recommended
            </Badge>
          </div>
        )}

        {/* Canvas Preview with enhanced states */}
        {userImageUrl ? (
          <div className="flex justify-center">
            <div className={`
              w-36 h-36 md:w-40 md:h-40 transition-all duration-500
              ${cardState === "selected" ? 'scale-110 drop-shadow-2xl' : 'group-hover:scale-105'}
            `}>
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
            flex justify-center p-8 md:p-10 rounded-3xl transition-all duration-500 relative min-h-[160px] items-center
            ${cardState === "selected"
              ? 'bg-gradient-to-br from-purple-100 to-pink-100 text-purple-600 scale-105'
              : cardState === "recommended"
              ? 'bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600 group-hover:scale-105'
              : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 group-hover:from-purple-50 group-hover:to-pink-50 group-hover:text-purple-400 group-hover:scale-105'
            }
          `}>
            <div className={`
              text-6xl md:text-7xl transition-all duration-500
              ${cardState === "selected" ? 'animate-pulse scale-110' : 'group-hover:scale-110'}
            `}>
              {getOrientationIcon(orientation.id)}
            </div>
            
            {/* Selection indicator */}
            {isSelected && (
              <div className="absolute -top-3 -right-3">
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full shadow-lg animate-bounce">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Selected
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Text Content with state-aware styling */}
        <div className="text-center space-y-4 flex-1 flex flex-col justify-end">
          <h5 className={`
            font-bold text-xl md:text-2xl font-poppins tracking-tight leading-tight transition-colors duration-300
            ${cardState === "selected" ? 'text-purple-700' : 'text-gray-900'}
          `}>
            {orientation.name}
          </h5>
          
          <p className={`
            text-base md:text-lg leading-relaxed font-medium px-2 transition-colors duration-300
            ${cardState === "selected" ? 'text-purple-600' : 'text-gray-600'}
          `}>
            {orientation.description}
          </p>
          
          {/* Enhanced selection confirmation */}
          {isSelected && (
            <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200 animate-fade-in">
              <p className="text-sm md:text-base text-purple-700 font-semibold flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5 animate-pulse" />
                Perfect choice for your image
              </p>
            </div>
          )}
          
          {/* Recommended indicator */}
          {isRecommended && !isSelected && (
            <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
              <p className="text-sm md:text-base text-amber-700 font-semibold flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Recommended
              </p>
            </div>
          )}
        </div>

        {/* Enhanced selection effects */}
        {isSelected && (
          <>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-purple-500/5 pointer-events-none animate-pulse" />
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-400/10 to-pink-400/10 blur-sm pointer-events-none animate-pulse" />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default OrientationCard;
