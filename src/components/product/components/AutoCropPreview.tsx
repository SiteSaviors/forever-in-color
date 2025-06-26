
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
    onAcceptCrop(croppedImageUrl || imageUrl);
  };

  return (
    <div className="space-y-6">
      {/* AI Analysis Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="relative p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl shadow-lg">
            <Zap className="w-8 h-8 text-purple-600" />
            {analysisComplete && !isGeneratingCrop && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
            {isGeneratingCrop && (
              <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-pink-500 animate-pulse" />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-gray-900">
            {analysisComplete && !isGeneratingCrop ? (
              <>AI Analysis Complete! <span className="text-green-600">✨</span></>
            ) : (
              <>Analyzing Your Photo... <span className="animate-pulse">🧠</span></>
            )}
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            {analysisComplete && !isGeneratingCrop
              ? "We've found the perfect crop and canvas orientation for your image"
              : "Our AI is detecting the best composition and canvas format"
            }
          </p>
        </div>
      </div>

      {/* Preview Area */}
      {showPreview && (
        <Card className="overflow-hidden border-2 border-dashed border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="p-6 space-y-4">
            {/* Crop Preview with Smart Crop Applied */}
            <div className="relative rounded-xl overflow-hidden shadow-lg bg-white">
              {isGeneratingCrop ? (
                <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <Sparkles className="w-8 h-8 text-purple-500 animate-spin mx-auto" />
                    <p className="text-gray-600">Applying smart crop...</p>
                  </div>
                </div>
              ) : (
                <img 
                  src={croppedImageUrl || imageUrl} 
                  alt="AI smart crop preview" 
                  className="w-full h-64 object-cover"
                />
              )}
              
              {/* Smart Crop Overlay */}
              {!isGeneratingCrop && (
                <div className="absolute inset-0 border-4 border-purple-400 border-dashed bg-purple-400/10">
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-purple-500 text-white shadow-lg">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Smart Crop Applied
                    </Badge>
                  </div>
                </div>
              )}
            </div>

            {/* Orientation Recommendation */}
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Zap className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">Recommended: {recommendedOrientation} Canvas</h4>
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
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
              >
                <Check className="w-4 h-4 mr-2" />
                Perfect! Use This
              </Button>
              <Button
                onClick={onCustomizeCrop}
                variant="outline"
                className="border-purple-300 text-purple-600 hover:bg-purple-50"
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
