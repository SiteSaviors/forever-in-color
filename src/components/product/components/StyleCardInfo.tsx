
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Zap, RefreshCw, CheckCircle, Download } from "lucide-react";
import { useState } from "react";
import WatermarkRemovalModal from "./WatermarkRemovalModal";
import { useDownloadPurchases } from "@/hooks/useDownloadPurchases";

interface StyleCardInfoProps {
  style: {
    id: number;
    name: string;
    description: string;
  };
  hasGeneratedPreview: boolean;
  isPopular: boolean;
  isSelected: boolean;
  showGeneratedBadge: boolean;
  showContinueInCard: boolean;
  shouldBlur: boolean;
  showError: boolean;
  onContinueClick: (e: React.MouseEvent) => void;
  onGenerateClick: (e: React.MouseEvent) => void;
  onRetryClick: (e: React.MouseEvent) => void;
  imageUrl?: string;
  isHorizontalOrientation?: boolean;
}

const StyleCardInfo = ({
  style,
  hasGeneratedPreview,
  isPopular,
  isSelected,
  showGeneratedBadge,
  showContinueInCard,
  shouldBlur,
  showError,
  onContinueClick,
  onGenerateClick,
  onRetryClick,
  imageUrl,
  isHorizontalOrientation = false
}: StyleCardInfoProps) => {
  const [isWatermarkModalOpen, setIsWatermarkModalOpen] = useState(false);
  const { getPurchaseForStyleAndImage, redownloadPurchase } = useDownloadPurchases();

  // Check if user has already purchased this style/image combination
  const existingPurchase = imageUrl && hasGeneratedPreview ? 
    getPurchaseForStyleAndImage(style.id, imageUrl) : null;

  const getStylePills = (styleId: number) => {
    const pillConfigs: {
      [key: number]: {
        pills: Array<{
          text: string;
          gradient: string;
        }>;
      };
    } = {
      1: {
        pills: [{
          text: "Original",
          gradient: "from-gray-500 to-gray-700"
        }]
      },
      2: {
        pills: [{
          text: "Classic",
          gradient: "from-amber-500 to-orange-600"
        }, {
          text: "Refined",
          gradient: "from-yellow-500 to-amber-600"
        }]
      },
      4: {
        pills: [{
          text: "Serene",
          gradient: "from-blue-500 to-cyan-600"
        }, {
          text: "Abstract",
          gradient: "from-orange-500 to-red-600"
        }]
      },
      5: {
        pills: [{
          text: "Dreamy",
          gradient: "from-pink-500 to-rose-600"
        }, {
          text: "Soft",
          gradient: "from-purple-500 to-pink-600"
        }]
      },
      6: {
        pills: [{
          text: "Geometric",
          gradient: "from-emerald-500 to-teal-600"
        }, {
          text: "Modern",
          gradient: "from-green-500 to-emerald-600"
        }]
      },
      7: {
        pills: [{
          text: "Whimsical",
          gradient: "from-blue-500 to-indigo-600"
        }, {
          text: "3D",
          gradient: "from-cyan-500 to-blue-600"
        }]
      },
      8: {
        pills: [{
          text: "Artistic",
          gradient: "from-slate-600 to-gray-700"
        }, {
          text: "Textured",
          gradient: "from-gray-600 to-slate-700"
        }]
      },
      9: {
        pills: [{
          text: "Bold",
          gradient: "from-pink-600 to-rose-700"
        }, {
          text: "Vibrant",
          gradient: "from-fuchsia-600 to-pink-700"
        }]
      },
      10: {
        pills: [{
          text: "Electric",
          gradient: "from-green-500 to-emerald-600"
        }, {
          text: "Neon",
          gradient: "from-lime-500 to-green-600"
        }]
      },
      11: {
        pills: [{
          text: "Dynamic",
          gradient: "from-purple-600 to-violet-700"
        }, {
          text: "Bloom",
          gradient: "from-indigo-600 to-purple-700"
        }]
      },
      13: {
        pills: [{
          text: "Abstract",
          gradient: "from-blue-600 to-indigo-700"
        }, {
          text: "Fusion",
          gradient: "from-cyan-600 to-blue-700"
        }]
      },
      15: {
        pills: [{
          text: "Luxe",
          gradient: "from-yellow-600 to-amber-700"
        }, {
          text: "Deco",
          gradient: "from-amber-600 to-orange-700"
        }]
      }
    };
    return pillConfigs[styleId] || {
      pills: [{
        text: "Style",
        gradient: "from-gray-500 to-gray-700"
      }]
    };
  };

  const getStyleEmoji = (styleId: number) => {
    const emojiMap: {
      [key: number]: string;
    } = {
      1: "📸",
      2: "🎨",
      4: "🌊",
      5: "🌸",
      6: "💎",
      7: "📚",
      8: "✏️",
      9: "💥",
      10: "⚡",
      11: "🌸",
      13: "🔮",
      15: "✨"
    };
    return emojiMap[styleId] || "🎨";
  };

  const styleConfig = getStylePills(style.id);
  const styleEmoji = getStyleEmoji(style.id);

  const showGenerateButton = !hasGeneratedPreview && !showError && style.id !== 1;
  const showContinueButton = hasGeneratedPreview && !showError;
  const showOriginalContinueButton = style.id === 1 && isSelected;
  const showRetryButton = showError;
  const showWatermarkRemovalButton = hasGeneratedPreview && !showError && imageUrl && style.id !== 1 && !existingPurchase;
  const showRedownloadButton = hasGeneratedPreview && !showError && imageUrl && style.id !== 1 && existingPurchase;

  const handleRemoveWatermark = async (resolution: string, tokens: number) => {
    console.log('Removing watermark for:', { style: style.id, resolution, tokens });
  };

  const handleRedownload = async () => {
    if (existingPurchase) {
      const fileName = `${style.name.replace(/\s+/g, '_')}_${existingPurchase.resolution_tier}.png`;
      await redownloadPurchase(existingPurchase.id, fileName);
    }
  };

  // Get orientation-specific spacing
  const getOrientationSpacing = () => {
    if (isHorizontalOrientation) {
      return "space-y-1.5"; // Tighter spacing for horizontal orientation
    }
    return "space-y-2"; // Standard spacing
  };

  // Get orientation-specific text sizing
  const getDescriptionClasses = () => {
    if (isHorizontalOrientation) {
      return "text-xs text-gray-600 line-clamp-1 mt-0.5 font-poppins leading-relaxed transition-colors duration-200"; // Single line for horizontal
    }
    return "text-xs text-gray-600 line-clamp-2 mt-0.5 font-poppins leading-relaxed transition-colors duration-200"; // Two lines for others
  };

  return (
    <>
      <div className={getOrientationSpacing()}>
        {/* Enhanced Pills Section with better spacing and transitions */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {styleConfig.pills.map((pill, index) => (
            <div
              key={index}
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${pill.gradient} shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02]`}
            >
              {pill.text}
            </div>
          ))}
        </div>

        {/* Header Section with improved badge positioning */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-poppins font-semibold text-gray-900 truncate text-sm leading-tight transition-colors duration-200 hover:text-gray-700">
              {styleEmoji} {style.name}
            </h3>
            <p className={getDescriptionClasses()}>
              {style.description}
            </p>
          </div>
          
          {/* Enhanced Badge Section with better positioning and animations */}
          <div className="flex flex-col gap-1 flex-shrink-0 items-end">
            {isPopular && (
              <Badge className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-xs px-2 py-0.5 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02]">
                <Sparkles className="w-3 h-3 mr-1" />
                Popular
              </Badge>
            )}
            {showGeneratedBadge && (
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-0.5 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02]">
                <Zap className="w-3 h-3 mr-1" />
                Ready
              </Badge>
            )}
            {existingPurchase && (
              <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs px-2 py-0.5 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02]">
                <Download className="w-3 h-3 mr-1" />
                Purchased
              </Badge>
            )}
          </div>
        </div>

        {/* Enhanced Button Section with professional polish */}
        <div className="flex flex-col gap-1.5 mt-2">
          <div className="flex gap-1.5">
            {showGenerateButton && (
              <Button 
                onClick={onGenerateClick} 
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 font-poppins h-8 px-3"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Generate This Style
              </Button>
            )}

            {showContinueButton && (
              <Button 
                onClick={onContinueClick} 
                className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white text-xs font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 font-poppins ring-2 ring-emerald-200 ring-offset-1 h-8 px-3"
              >
                <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                Continue with This Style
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            )}

            {showOriginalContinueButton && (
              <Button 
                onClick={onContinueClick} 
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-xs font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 font-poppins h-8 px-3"
              >
                Use Original
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            )}

            {showRetryButton && (
              <Button 
                onClick={onRetryClick} 
                variant="outline" 
                className="flex-1 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 font-poppins h-8 px-3"
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
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 text-xs font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 font-poppins h-8 px-3"
            >
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              Remove Watermark & Download
            </Button>
          )}

          {showRedownloadButton && (
            <div className="space-y-1.5">
              <Button
                onClick={handleRedownload}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 font-poppins h-8 px-3"
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

export default StyleCardInfo;
