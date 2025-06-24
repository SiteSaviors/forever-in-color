
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

interface StyleCardInfoProps {
  style: {
    id: number;
    name: string;
    description: string;
    image: string;
  };
  hasGeneratedPreview: boolean;
  isPopular: boolean;
  isSelected: boolean;
  showGeneratedBadge: boolean;
  showContinueInCard: boolean;
  shouldBlur?: boolean;
  onContinueClick: (e: React.MouseEvent) => void;
  onGenerateClick?: (e: React.MouseEvent) => void;
}

const StyleCardInfo = ({
  style,
  hasGeneratedPreview,
  isPopular,
  isSelected,
  showGeneratedBadge,
  showContinueInCard,
  shouldBlur = false,
  onContinueClick,
  onGenerateClick
}: StyleCardInfoProps) => {
  // Don't show generate button for Original Image (ID: 1) or when blurred
  const showGenerateButton = style.id !== 1 && !shouldBlur;
  
  return (
    <div className={`p-4 space-y-3 min-h-[90px] flex flex-col justify-between relative ${shouldBlur ? 'opacity-50' : ''}`}>
      {/* Clean title and description */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h5 className="font-playfair font-bold text-gray-900 text-lg leading-tight tracking-wide flex-1">
            {style.name}
          </h5>
          {/* Only show Generated badge for auto-generated popular styles */}
          {showGeneratedBadge && hasGeneratedPreview && isPopular && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs px-2 py-0.5 h-auto">
              <Sparkles className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Generated</span>
            </Badge>
          )}
        </div>

        {/* Clean description */}
        <p className="font-inter text-sm text-gray-600 leading-relaxed line-clamp-2">
          {style.description}
        </p>
      </div>
      
      {/* Action buttons - only show for generated styles and when not blurred */}
      {showGenerateButton && hasGeneratedPreview && (
        <div className="pt-1">
          <Button 
            onClick={onContinueClick}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm py-2 h-auto font-medium"
          >
            Continue with Style
          </Button>
        </div>
      )}
    </div>
  );
};

export default StyleCardInfo;
