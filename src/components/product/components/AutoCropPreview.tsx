
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Check, Edit3, Zap } from "lucide-react";
import { generateSmartCrop } from "../utils/smartCropUtils";

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

  // Dynamic sizing based on orientation
  const getDynamicCropStyles = (orientation: string) => {
    switch (orientation) {
      case 'vertical':
        return {
          containerClass: "w-full max-w-md mx-auto", // Narrower container for vertical
          imageClass: "w-full object-cover",
          aspectRatio: "2/3", // 2:3 for vertical (portrait)
          heightClass: "h-96" // Taller for vertical
        };
      case 'horizontal':
        return {
          containerClass: "w-full max-w-2xl mx-auto", // Wider container for horizontal
          imageClass: "w-full object-cover",
          aspectRatio: "3/2", // 3:2 for horizontal (landscape)
          heightClass: "h-48" // Shorter for horizontal
        };
      case 'square':
      default:
        return {
          containerClass: "w-full max-w-lg mx-auto", // Balanced container for square
          imageClass: "w-full object-cover",
          aspectRatio: "1/1", // 1:1 for square
          heightClass: "h-64" // Balanced height for square
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
    <div className="space-y-6">
      {/* AI Analysis Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="relative p-4 bg-gradient-to-br from-cyan-100/80 to-fuchsia-100/80 rounded-2xl shadow-2xl backdrop-blur-sm">
            <Zap className="w-8 h-8 text-cyan-600" />
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

        <div className="space-y-2">
          <h3 className="font-montserrat font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight drop-shadow-2xl">
            {analysisComplete && !isGeneratingCrop ? (
              <>
                <span className="text-white block mb-2">AI Analysis</span>
                <span className="bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent font-oswald">
                  COMPLETE! ✨
                </span>
              </>
            ) : (
              <>
                <span className="text-white block mb-2">Analyzing</span>
                <span className="bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent font-oswald animate-pulse">
                  YOUR PHOTO 🧠
                </span>
              </>
            )}
          </h3>
          <p className="font-poppins text-white/90 max-w-xl mx-auto text-base sm:text-lg lg:text-xl drop-shadow-lg">
            {analysisComplete && !isGeneratingCrop
              ? "We've discovered the perfect crop and premium canvas orientation for your treasured image"
              : "Our AI is detecting the optimal composition and artistic canvas format for maximum impact"
            }
          </p>
        </div>
      </div>

      {/* Preview Area */}
      {showPreview && (
        <Card className="overflow-hidden border-2 border-dashed border-cyan-200/60 bg-gradient-to-br from-cyan-50/80 via-violet-50/60 to-fuchsia-100/40 backdrop-blur-xl shadow-2xl">
          <div className="p-6 space-y-4">
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

            {/* Orientation Recommendation */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-cyan-200/60 shadow-lg">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gradient-to-br from-cyan-100/80 to-fuchsia-100/80 rounded-lg shadow-md">
                  <Zap className="w-5 h-5 text-cyan-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-montserrat font-black text-lg text-gray-900">
                      <span className="bg-gradient-to-r from-cyan-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                        Recommended: {recommendedOrientation} Canvas
                      </span>
                      <span className="text-sm font-normal text-cyan-600/80 ml-2">
                        ({dynamicStyles.aspectRatio.replace('/', ':')})
                      </span>
                    </h4>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      AI Suggested
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {getOrientationReason(recommendedOrientation)}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleAcceptCrop}
                disabled={isGeneratingCrop}
                className="flex-1 bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 hover:from-cyan-600 hover:via-violet-600 hover:to-fuchsia-600 text-white shadow-2xl backdrop-blur-sm transform transition-all duration-300 hover:scale-105"
              >
                <Check className="w-4 h-4 mr-2" />
                Perfect! Use This
              </Button>
              <Button
                onClick={onCustomizeCrop}
                variant="outline"
                className="border-cyan-300/60 text-cyan-600 hover:bg-cyan-50/80 backdrop-blur-sm transform transition-all duration-300 hover:scale-105"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Adjust Crop
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AutoCropPreview;
