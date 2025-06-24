
import PhotoUpload from "./PhotoUpload";
import StyleGrid from "./StyleGrid";
import { useStylePreview } from "./contexts/StylePreviewContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";

interface PhotoUploadAndStyleSelectionProps {
  selectedStyle: {id: number, name: string} | null;
  uploadedImage?: string | null;
  selectedOrientation?: string;
  autoGenerationComplete: boolean;
  onComplete: (imageUrl: string, styleId: number, styleName: string) => void;
  onPhotoAndStyleComplete?: (imageUrl: string, styleId: number, styleName: string) => void;
  onContinue?: () => void;
}

const PhotoUploadAndStyleSelection = ({
  selectedStyle,
  uploadedImage,
  selectedOrientation,
  autoGenerationComplete,
  onComplete,
  onPhotoAndStyleComplete,
  onContinue
}: PhotoUploadAndStyleSelectionProps) => {
  const { croppedImage } = useStylePreview();

  // Use the uploaded image from props or the cropped image from context
  const currentImage = uploadedImage || croppedImage;

  const handleImageUpload = (imageUrl: string) => {
    console.log('Image uploaded and cropped:', imageUrl);
    // Immediately trigger the photo completion so the parent can update state
    // This will cause the parent to set uploadedImage and show style selection
    if (onPhotoAndStyleComplete) {
      // For now, we'll pass a default style ID since we need to complete the photo step
      // The user can then select their preferred style
      onPhotoAndStyleComplete(imageUrl, 1, "temp-style");
    }
  };

  const handleStyleSelect = (styleId: number, styleName: string) => {
    if (currentImage) {
      onComplete(currentImage, styleId, styleName);
      if (onPhotoAndStyleComplete) {
        onPhotoAndStyleComplete(currentImage, styleId, styleName);
      }
    }
  };

  const handleContinueToNextStep = () => {
    if (onContinue) {
      onContinue();
    }
  };

  // Show continue button when user has both image and style selected
  const showContinueButton = currentImage && selectedStyle && selectedStyle.name !== "temp-style";

  return (
    <div className="space-y-8">
      {!currentImage && (
        <PhotoUpload onImageUpload={handleImageUpload} />
      )}
      
      {currentImage && (
        <>
          <StyleGrid
            croppedImage={currentImage}
            selectedStyle={selectedStyle?.id || null}
            onStyleSelect={handleStyleSelect}
            onComplete={() => {}}
          />
          
          {showContinueButton && (
            <div className="flex justify-center pt-6">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Perfect! Your {selectedStyle.name} style is ready</span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Continue to choose your canvas size and customize your order
                  </p>
                  <Button
                    onClick={handleContinueToNextStep}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                  >
                    Continue to Size Selection
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PhotoUploadAndStyleSelection;
