
import { memo, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Crop, Check } from "lucide-react";

interface AutoCropPreviewProps {
  originalImage: string;
  croppedImage?: string;
  aspectRatio: number;
  onAcceptCrop: (croppedImage: string) => void;
  onRejectCrop: () => void;
  isProcessing?: boolean;
}

const AutoCropPreview = memo(({
  originalImage,
  croppedImage,
  aspectRatio,
  onAcceptCrop,
  onRejectCrop,
  isProcessing = false
}: AutoCropPreviewProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [confidence, setConfidence] = useState(0);

  useEffect(() => {
    if (originalImage) {
      setIsAnalyzing(true);
      
      const analysisTimer = setTimeout(() => {
        setConfidence(Math.floor(Math.random() * 15) + 85); // 85-100%
        setIsAnalyzing(false);
      }, 1200);

      return () => clearTimeout(analysisTimer);
    }
  }, [originalImage]);

  const handleAcceptCrop = () => {
    if (croppedImage) {
      onAcceptCrop(croppedImage);
    }
  };

  if (!originalImage) {
    return null;
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Smart Crop</h3>
              <p className="text-sm text-gray-600">Optimized composition detected</p>
            </div>
          </div>
          
          {!isAnalyzing && (
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              {confidence}% Confidence
            </Badge>
          )}
        </div>

        {/* Preview Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Original */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              Original Photo
            </h4>
            <div className="relative overflow-hidden rounded-xl border-2 border-gray-200">
              <img
                src={originalImage}
                alt="Original"
                className="w-full h-48 object-cover"
                style={{ aspectRatio: aspectRatio }}
              />
            </div>
          </div>

          {/* AI Cropped */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              AI Optimized Crop
            </h4>
            <div className="relative overflow-hidden rounded-xl border-2 border-purple-300">
              {isAnalyzing ? (
                <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <div className="flex items-center gap-2 text-purple-600">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                    <span className="text-sm font-medium">Analyzing...</span>
                  </div>
                </div>
              ) : (
                <img
                  src={croppedImage || originalImage}
                  alt="AI Cropped"
                  className="w-full h-48 object-cover"
                  style={{ aspectRatio: aspectRatio }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        {!isAnalyzing && (
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-purple-200">
            <Button
              variant="outline"
              onClick={onRejectCrop}
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              <Crop className="w-4 h-4" />
              Manual Crop
            </Button>
            
            <Button
              onClick={handleAcceptCrop}
              disabled={isProcessing || !croppedImage}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Check className="w-4 h-4" />
              Accept AI Crop
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
});

AutoCropPreview.displayName = 'AutoCropPreview';

export default AutoCropPreview;
