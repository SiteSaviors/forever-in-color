
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MobileButton } from "@/components/ui/mobile-button";
import { MobileTypography } from "@/components/ui/mobile-typography";
import { Sparkles, Check, Edit3, Zap } from "lucide-react";
import { generateSmartCrop } from "../utils/smartCropUtils";
import { useIsMobile } from "@/hooks/use-mobile";

interface AutoCropPreviewProps {
  imageUrl: string;
  onAcceptCrop: (croppedImageUrl: string) => void;
  onCustomizeCrop: () => void;
  recommendedOrientation: string;
}

  const AutoCropPreview = ({ 
    imageUrl, 
    onAcceptCrop, 
    onCustomizeCrop, 
    recommendedOrientation 
  }: AutoCropPreviewProps) => {
    const [showPreview, setShowPreview] = useState(false);
    const [analysisComplete, setAnalysisComplete] = useState(false);
    const [croppedImageUrl, setCroppedImageUrl] = useState<string>("");
    const [isGeneratingCrop, setIsGeneratingCrop] = useState(true);
    const isMobile = useIsMobile();

  // Dynamic sizing based on orientation with mobile optimization
  const getDynamicCropStyles = (orientation: string) => {
    switch (orientation) {
      case 'vertical':
        return {
          containerClass: "w-full max-w-md mx-auto",
          imageClass: "w-full object-cover",
          aspectRatio: "2/3",
          heightClass: "h-56 sm:h-96" // Shorter on mobile
        };
      case 'horizontal':
        return {
          containerClass: "w-full max-w-2xl mx-auto",
          imageClass: "w-full object-cover",
          aspectRatio: "3/2",
          heightClass: "h-32 sm:h-48" // Shorter on mobile
        };
      case 'square':
      default:
        return {
          containerClass: "w-full max-w-lg mx-auto",
          imageClass: "w-full object-cover",
          aspectRatio: "1/1",
          heightClass: "h-40 sm:h-64" // Shorter on mobile
        };
    }
  };

  const dynamicStyles = getDynamicCropStyles(recommendedOrientation);

  useEffect(() => {
    // Generate actual smart crop
    const generateCrop = async () => {
      console.log('🎯 Starting smart crop generation for:', recommendedOrientation);
      setIsGeneratingCrop(true);
      
      try {
        const smartCroppedUrl = await generateSmartCrop(imageUrl, recommendedOrientation);
        setCroppedImageUrl(smartCroppedUrl);
        console.log('✅ Smart crop completed');
      } catch (error) {
        console.error('❌ Smart crop failed:', error);
        setCroppedImageUrl(imageUrl); // Fallback to original
      }
      
      setIsGeneratingCrop(false);
    };

    // Simulate AI analysis with realistic timing
    const timer1 = setTimeout(() => {
      setShowPreview(true);
      generateCrop();
    }, 800);
    
    const timer2 = setTimeout(() => setAnalysisComplete(true), 1500);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [imageUrl, recommendedOrientation]);

  const getOrientationReason = (orientation: string) => {
    switch (orientation) {
      case 'horizontal':
        return 'Landscape composition detected - perfect for wide shots';
      case 'vertical':
        return 'Portrait orientation detected - ideal for people & tall subjects';
      case 'square':
      default:
        return 'Balanced composition - great for social media & symmetric art';
    }
  };

  const handleAcceptCrop = () => {
    console.log('✅ User accepted smart crop');
    // Always use the cropped image URL, never the original
    onAcceptCrop(croppedImageUrl);
  };

  return (
    <div className="space-y-3 sm:space-y-6">
      {/* AI Analysis Header */}
      <div className="text-center space-y-2 sm:space-y-4">
        <div className="flex justify-center">
          <div className="relative p-3 sm:p-4 bg-gradient-to-br from-cyan-100/80 to-fuchsia-100/80 rounded-xl sm:rounded-2xl shadow-2xl backdrop-blur-sm">
            <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-600" />
            {analysisComplete && !isGeneratingCrop && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
            {isGeneratingCrop && (
              <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-fuchsia-500 animate-pulse" />
            )}
          </div>
        </div>

        <div className="space-y-1 sm:space-y-2">
          <MobileTypography 
            variant="h2" 
            className="font-montserrat font-black tracking-tight drop-shadow-2xl"
          >
            {analysisComplete && !isGeneratingCrop ? (
              <>
                <span className="text-white block mb-1 sm:mb-2">AI Analysis</span>
                <span className="bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent font-oswald">
                  COMPLETE! ✨
                </span>
              </>
            ) : (
              <>
                <span className="text-white block mb-1 sm:mb-2">Analyzing</span>
                <span className="bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent font-oswald animate-pulse">
                  YOUR PHOTO 🧠
                </span>
              </>
            )}
          </MobileTypography>
          <MobileTypography 
            variant="body"
            className="font-poppins text-white/90 max-w-xl mx-auto drop-shadow-lg"
          >
            {analysisComplete && !isGeneratingCrop
              ? "We've discovered the perfect crop and premium canvas orientation for your treasured image"
              : "Our AI is detecting the optimal composition and artistic canvas format for maximum impact"
            }
          </MobileTypography>
        </div>
      </div>

      {/* Preview Area */}
      {showPreview && (
        <Card className="overflow-hidden border-2 border-dashed border-cyan-200/60 bg-gradient-to-br from-cyan-50/80 via-violet-50/60 to-fuchsia-100/40 backdrop-blur-xl shadow-2xl">
          <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
            {/* Dynamic Crop Preview Container */}
            <div className={`${dynamicStyles.containerClass} transition-all duration-500 ease-in-out`}>
              {/* Crop Preview with Smart Crop Applied */}
              <div className="relative rounded-xl overflow-hidden shadow-lg bg-white transform transition-all duration-700 hover:scale-[1.02]">
                {isGeneratingCrop ? (
                  <div 
                    className={`${dynamicStyles.imageClass} ${dynamicStyles.heightClass} bg-gray-100 flex items-center justify-center`}
                    style={{ aspectRatio: dynamicStyles.aspectRatio }}
                  >
                    <div className="text-center space-y-2">
                      <Sparkles className="w-8 h-8 text-cyan-500 animate-spin mx-auto" />
                      <p className="text-gray-600">Applying smart crop...</p>
                      <div className="flex items-center justify-center gap-1">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-fuchsia-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <img 
                      src={croppedImageUrl} 
                      alt="AI smart crop preview" 
                      className={`${dynamicStyles.imageClass} transition-all duration-500`}
                      style={{ aspectRatio: dynamicStyles.aspectRatio }}
                    />
                    
                    {/* Smart Crop Overlay - only show when we have a cropped image different from original */}
                    {croppedImageUrl !== imageUrl && (
                      <div className="absolute inset-0 border-4 border-cyan-400 border-dashed bg-cyan-400/10 rounded-xl animate-pulse">
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white shadow-lg animate-fade-in">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Smart Crop Applied
                          </Badge>
                        </div>
                        
                        {/* Orientation indicator */}
                        <div className="absolute bottom-2 right-2">
                          <Badge className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg text-xs">
                            {recommendedOrientation.charAt(0).toUpperCase() + recommendedOrientation.slice(1)} Format
                          </Badge>
                        </div>
                        
                        {/* Subtle corner accents */}
                        <div className="absolute top-1 left-1 w-4 h-4 border-l-2 border-t-2 border-cyan-500 rounded-tl-lg"></div>
                        <div className="absolute top-1 right-1 w-4 h-4 border-r-2 border-t-2 border-cyan-500 rounded-tr-lg"></div>
                        <div className="absolute bottom-1 left-1 w-4 h-4 border-l-2 border-b-2 border-cyan-500 rounded-bl-lg"></div>
                        <div className="absolute bottom-1 right-1 w-4 h-4 border-r-2 border-b-2 border-cyan-500 rounded-br-lg"></div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Orientation Recommendation - Mobile Optimized */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-cyan-200/60 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-cyan-100/80 to-fuchsia-100/80 rounded-lg shadow-md flex-shrink-0">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                    <MobileTypography 
                      variant="h4" 
                      className="font-montserrat font-black text-gray-900 leading-tight"
                    >
                      <span className="bg-gradient-to-r from-cyan-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                        Recommended: {recommendedOrientation} Canvas
                      </span>
                      <span className="text-xs sm:text-sm font-normal text-cyan-600/80 ml-1 sm:ml-2">
                        ({dynamicStyles.aspectRatio.replace('/', ':')})
                      </span>
                    </MobileTypography>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 self-start sm:self-auto text-xs">
                      AI Suggested
                    </Badge>
                  </div>
                  <MobileTypography variant="caption" className="text-gray-600">
                    {getOrientationReason(recommendedOrientation)}
                  </MobileTypography>
                </div>
              </div>
            </div>

            {/* Action Buttons - Mobile Optimized */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <MobileButton
                onClick={handleAcceptCrop}
                disabled={isGeneratingCrop}
                size="lg"
                className="flex-1 bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 hover:from-cyan-600 hover:via-violet-600 hover:to-fuchsia-600 text-white shadow-2xl backdrop-blur-sm transform transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
              >
                <Check className="w-4 h-4 mr-2" />
                <span className="font-semibold">Perfect! Use This</span>
              </MobileButton>
              <MobileButton
                onClick={onCustomizeCrop}
                variant="outline"
                size="lg"
                className="border-cyan-300/60 text-cyan-600 hover:bg-cyan-50/80 backdrop-blur-sm transform transition-all duration-300 hover:scale-105"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                <span className="font-semibold">Adjust Crop</span>
              </MobileButton>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AutoCropPreview;
