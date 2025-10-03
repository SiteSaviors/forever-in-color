
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Zap, RefreshCw, CheckCircle, Download } from "@/components/ui/icons";
import { useState } from "react";
import WatermarkRemovalModal from "./WatermarkRemovalModal";

interface StyleCardButtonsProps {
  style: {
    id: number;
    name: string;
    description: string;
  };
  hasGeneratedPreview: boolean;
  isSelected: boolean;
  showError: boolean;
  onContinueClick: (e: React.MouseEvent) => void;
  onGenerateClick: (e: React.MouseEvent) => void;
  onRetryClick: (e: React.MouseEvent) => void;
  imageUrl?: string;
  existingPurchase: any;
  onRedownload: () => Promise<void>;
}

const StyleCardButtons = ({
  style,
  hasGeneratedPreview,
  isSelected,
  showError,
  onContinueClick,
  onGenerateClick,
  onRetryClick,
  imageUrl,
  existingPurchase,
  onRedownload
}: StyleCardButtonsProps) => {
  const [isWatermarkModalOpen, setIsWatermarkModalOpen] = useState(false);

  const showGenerateButton = !hasGeneratedPreview && !showError && style.id !== 1;
  const showContinueButton = hasGeneratedPreview && !showError;
  const showOriginalContinueButton = style.id === 1 && isSelected;
  const showRetryButton = showError;
  const showWatermarkRemovalButton = hasGeneratedPreview && !showError && imageUrl && style.id !== 1 && !existingPurchase;
  const showRedownloadButton = hasGeneratedPreview && !showError && imageUrl && style.id !== 1 && existingPurchase;

  const handleRemoveWatermark = async (_resolution: string, _tokens: number) => {
    // Removing watermark for style
  };

  return (
    <>
      <div className="flex flex-col gap-1.5 mt-2">
        <div className="flex gap-1.5">
          {showGenerateButton && (
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onGenerateClick(e);
              }} 
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 font-poppins h-8 px-2"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Generate This Style
            </Button>
          )}

          {showContinueButton && (
            <Button 
              onClick={onContinueClick} 
              className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white text-xs font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 font-poppins ring-2 ring-emerald-200 ring-offset-1 h-8 px-2"
            >
              <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
              Continue with This Style
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          )}

          {showOriginalContinueButton && (
            <Button 
              onClick={onContinueClick} 
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-xs font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 font-poppins h-8 px-2"
            >
              Use Original
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          )}

          {showRetryButton && (
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onRetryClick(e);
              }} 
              variant="outline" 
              className="flex-1 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 font-poppins h-8 px-2"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Try Again
            </Button>
          )}
        </div>

        {showWatermarkRemovalButton && (
          <Button
            onClick={() => setIsWatermarkModalOpen(true)}
            variant="outline"
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 text-xs font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 font-poppins h-8 px-2"
          >
            <Zap className="w-3.5 h-3.5 mr-1.5" />
            Remove Watermark & Download
          </Button>
        )}

        {showRedownloadButton && (
          <div className="space-y-1.5">
            <Button
              onClick={onRedownload}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 font-poppins h-8 px-2"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Re-download ({existingPurchase.resolution_tier})
            </Button>
            <p className="text-xs text-gray-500 text-center leading-tight transition-colors duration-200">
              Downloaded {existingPurchase.download_count} time(s) • {existingPurchase.tokens_spent} tokens spent
            </p>
          </div>
        )}
      </div>

      {showWatermarkRemovalButton && (
        <WatermarkRemovalModal
          isOpen={isWatermarkModalOpen}
          onClose={() => setIsWatermarkModalOpen(false)}
          imageUrl={imageUrl!}
          styleName={style.name}
          styleId={style.id}
          onRemoveWatermark={handleRemoveWatermark}
        />
      )}
    </>
  );
};

export default StyleCardButtons;
