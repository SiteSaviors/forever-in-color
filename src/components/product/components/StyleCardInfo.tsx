
import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Crown, Loader2, AlertCircle, RefreshCw } from "lucide-react";

interface StyleCardInfoProps {
  style: {
    id: number;
    name: string;
    description: string;
    image: string;
  };
  isPopular?: boolean;
  isSelected: boolean;
  hasGeneratedPreview: boolean;
  showGeneratedBadge: boolean;
  effectiveIsLoading: boolean;
  isPermanentlyGenerated: boolean;
  hasErrorBoolean: boolean;
  errorMessage: string;
  onContinueClick: (e: React.MouseEvent) => void;
  onGenerateClick: (e: React.MouseEvent) => void;
  onRetryClick: (e: React.MouseEvent) => void;
}

const StyleCardInfo = memo(({
  style,
  isPopular = false,
  isSelected,
  hasGeneratedPreview,
  showGeneratedBadge,
  effectiveIsLoading,
  isPermanentlyGenerated,
  hasErrorBoolean,
  errorMessage,
  onContinueClick,
  onGenerateClick,
  onRetryClick
}: StyleCardInfoProps) => {
  return (
    <div className="p-4 space-y-3">
      {/* Badges */}
      <div className="flex flex-wrap gap-1">
        {isPopular && (
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
            <Crown className="w-3 h-3 mr-1" />
            Popular
          </Badge>
        )}
        
        {showGeneratedBadge && (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
            <Sparkles className="w-3 h-3 mr-1" />
            Generated
          </Badge>
        )}
      </div>

      {/* Style Info */}
      <div>
        <h3 className="font-semibold text-lg text-gray-900 mb-1">{style.name}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{style.description}</p>
      </div>

      {/* Error State */}
      {hasErrorBoolean && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Generation Failed</span>
          </div>
          <p className="text-xs text-red-600 mt-1">{errorMessage}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {hasErrorBoolean ? (
          <Button
            size="sm"
            variant="outline"
            onClick={onRetryClick}
            disabled={effectiveIsLoading}
            className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Retry
          </Button>
        ) : effectiveIsLoading ? (
          <Button
            size="sm"
            disabled
            className="flex-1"
          >
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            Generating...
          </Button>
        ) : hasGeneratedPreview ? (
          <>
            <Button
              size="sm"
              variant={isSelected ? "default" : "outline"}
              className="flex-1"
            >
              {isSelected ? "Selected" : "Select"}
            </Button>
            {isSelected && (
              <Button
                size="sm"
                onClick={onContinueClick}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Continue
              </Button>
            )}
          </>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            onClick={onGenerateClick}
            disabled={effectiveIsLoading || isPermanentlyGenerated}
            className="flex-1"
          >
            <Sparkles className="w-4 h-4 mr-1" />
            Generate
          </Button>
        )}
      </div>
    </div>
  );
});

StyleCardInfo.displayName = 'StyleCardInfo';

export default StyleCardInfo;
