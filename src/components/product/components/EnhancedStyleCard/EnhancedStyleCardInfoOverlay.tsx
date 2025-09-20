
import { Star, Sparkles } from "lucide-react";

interface EnhancedStyleCardInfoOverlayProps {
  isHovered: boolean;
  styleName: string;
  styleDescription: string;
  confidence?: number;
  recommendationReason?: string;
}

const EnhancedStyleCardInfoOverlay = ({
  isHovered,
  styleName,
  styleDescription,
  confidence,
  recommendationReason
}: EnhancedStyleCardInfoOverlayProps) => {
  return (
    <div className={`absolute bottom-0 left-0 right-0 p-3 transition-all duration-300 z-30 ${
      isHovered ? 'translate-y-0' : 'translate-y-full'
    }`}>
      <div className="bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-2xl border border-white/30">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-bold text-gray-900 text-sm md:text-base">{styleName}</h4>
          {confidence && (
            <div className="flex ml-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.round(confidence * 5)
                      ? 'text-amber-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        <p className="text-xs md:text-sm text-gray-600 mb-3 leading-relaxed line-clamp-2">
          {styleDescription}
        </p>
        {recommendationReason && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
            <p className="text-xs text-amber-800 font-medium flex items-center">
              <Sparkles className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="line-clamp-2">{recommendationReason}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedStyleCardInfoOverlay;
