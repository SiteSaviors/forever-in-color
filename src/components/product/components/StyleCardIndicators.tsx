
import { Check, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StyleCardIndicatorsProps {
  isPopular: boolean;
  isLoading: boolean;
  hasGeneratedPreview: boolean;
  isSelected: boolean;
  isLocked: boolean;
}

const StyleCardIndicators = ({ 
  isPopular, 
  isLoading, 
  hasGeneratedPreview, 
  isSelected, 
  isLocked 
}: StyleCardIndicatorsProps) => {
  const showGeneratedIndicator = hasGeneratedPreview && !isSelected;

  return (
    <>
      {/* Popular Badge */}
      {isPopular && !isLoading && (
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="secondary" className="bg-white/90 text-purple-700 font-semibold text-xs">
            Popular
          </Badge>
        </div>
      )}
      
      {/* Generated Preview Indicator */}
      {showGeneratedIndicator && (
        <div className="absolute bottom-2 right-2 z-10">
          <div className="bg-green-600 text-white rounded-full p-1.5 shadow-lg">
            <Check className="w-3 h-3" />
          </div>
        </div>
      )}
      
      {/* Selected Indicator */}
      {isSelected && !isLoading && (
        <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center z-10">
          <div className="bg-purple-600 text-white rounded-full p-2">
            <Check className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Lock Overlay for locked styles */}
      {isLocked && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <div className="text-white text-center space-y-2 px-4">
            <Lock className="w-6 h-6 mx-auto" />
            <p className="text-xs font-medium leading-tight">Upload Your Photo to preview this style</p>
          </div>
        </div>
      )}
    </>
  );
};

export default StyleCardIndicators;
