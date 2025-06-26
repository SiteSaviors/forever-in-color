
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
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

  return (
    <Card 
      className={`group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 min-h-[280px] touch-manipulation ${
        isSelected 
          ? 'ring-4 ring-purple-300/60 shadow-2xl bg-gradient-to-br from-purple-50/60 to-pink-50/40 border-2 border-purple-300 scale-[1.02]' 
          : 'shadow-xl hover:shadow-purple-100/50 border border-gray-200 hover:border-purple-200'
      }`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`Select ${orientation.name} orientation`}
      onKeyDown={handleKeyDown}
    >
      <CardContent className="p-6 md:p-8 space-y-6 h-full flex flex-col justify-between">
        {/* Canvas Preview with enhanced touch area */}
        {userImageUrl ? (
          <div className="flex justify-center">
            <div className="w-36 h-36 md:w-40 md:h-40">
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
          <div className={`flex justify-center p-8 md:p-10 rounded-2xl transition-all duration-300 relative min-h-[160px] items-center ${
            isSelected
              ? 'bg-gradient-to-br from-purple-100 to-pink-100 text-purple-600'
              : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 group-hover:from-purple-50 group-hover:to-pink-50 group-hover:text-purple-400'
          }`}>
            <div className="text-6xl md:text-7xl">
              {getOrientationIcon(orientation.id)}
            </div>
            {isSelected && (
              <div className="absolute -top-3 -right-3">
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full shadow-lg">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Selected
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Text Content with better typography hierarchy */}
        <div className="text-center space-y-4 flex-1 flex flex-col justify-end">
          <h5 className="font-bold text-xl md:text-2xl text-gray-900 font-poppins tracking-tight leading-tight">
            {orientation.name}
          </h5>
          <p className="text-gray-600 text-base md:text-lg leading-relaxed font-medium px-2">
            {orientation.description}
          </p>
          {isSelected && (
            <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
              <p className="text-sm md:text-base text-purple-700 font-semibold flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Perfect choice for your image
              </p>
            </div>
          )}
        </div>

        {/* Premium selection glow effect */}
        {isSelected && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-purple-500/5 pointer-events-none"></div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrientationCard;
