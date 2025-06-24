
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
  onContinueClick,
  onGenerateClick
}: StyleCardInfoProps) => {
  // Don't show generate button for Original Image (ID: 1)
  const showGenerateButton = style.id !== 1;
  
  return (
    <div className="p-4 space-y-3 min-h-[90px] flex flex-col justify-between relative">
      {/* Clean title and description - no badges here */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h5 className="font-playfair font-bold text-gray-900 text-lg leading-tight tracking-wide flex-1">
            {style.name}
          </h5>
          {/* Only show Generated badge in top-right if needed */}
          {showGeneratedBadge && hasGeneratedPreview && (
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
      
      {/* Generate/Continue button for all styles except Original */}
      {showGenerateButton && (
        <div className="pt-1">
          {hasGeneratedPreview ? (
            <Button 
              onClick={onContinueClick}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm py-2 h-auto font-medium"
            >
              Continue with Style
            </Button>
          ) : (
            <Button 
              onClick={onGenerateClick}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm py-2 h-auto font-medium"
            >
              Generate This Style
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default StyleCardInfo;
