
import { useState, useEffect } from "react";
import PhotoUpload from "./PhotoUpload";
import StyleGrid from "./StyleGrid";
import { Button } from "@/components/ui/button";
import { ArrowRight, Upload, RotateCcw } from "lucide-react";

interface PhotoUploadAndStyleSelectionProps {
  selectedStyle: {id: number, name: string} | null;
  uploadedImage: string | null;
  selectedOrientation?: string;
  autoGenerationComplete: boolean;
  onComplete: (imageUrl: string, styleId: number, styleName: string) => void;
  onPhotoAndStyleComplete: (imageUrl: string, styleId: number, styleName: string) => void;
  onContinue: () => void;
}

const PhotoUploadAndStyleSelection = ({
  selectedStyle,
  uploadedImage,
  selectedOrientation = "square",
  autoGenerationComplete,
  onComplete,
  onPhotoAndStyleComplete,
  onContinue
}: PhotoUploadAndStyleSelectionProps) => {
  const [croppedImage, setCroppedImage] = useState<string | null>(uploadedImage);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [localSelectedStyle, setLocalSelectedStyle] = useState<{id: number, name: string} | null>(selectedStyle);
  const [showRecrop, setShowRecrop] = useState(false);

  // Update local state when props change
  useEffect(() => {
    setCroppedImage(uploadedImage);
  }, [uploadedImage]);

  useEffect(() => {
    setLocalSelectedStyle(selectedStyle);
  }, [selectedStyle]);

  const handlePhotoUpload = (imageUrl: string, originalImageUrl?: string) => {
    console.log('🎯 PhotoUploadAndStyleSelection: Photo uploaded:', imageUrl);
    setCroppedImage(imageUrl);
    
    // Store the original image for re-cropping
    if (originalImageUrl) {
      setOriginalImage(originalImageUrl);
    }
    
    // Call onComplete with temp values to update state in ProductStateLogic
    onComplete(imageUrl, 999, "temp-style");
    setShowRecrop(false);
  };

  const handleStyleSelect = async (styleId: number, styleName: string) => {
    console.log('🎯 PhotoUploadAndStyleSelection: Style selected:', styleId, styleName);
    
    if (!croppedImage) {
      console.warn('No cropped image available for style selection');
      return;
    }

    const newStyle = { id: styleId, name: styleName };
    setLocalSelectedStyle(newStyle);
    
    // Call the completion handler with the image and style
    onPhotoAndStyleComplete(croppedImage, styleId, styleName);
  };

  const handleRecropClick = () => {
    setShowRecrop(true);
  };

  // Updated to go to Step 2 instead of Step 3
  const handleStyleGridContinue = () => {
    console.log('🎯 PhotoUploadAndStyleSelection: Continue to Step 2');
    onContinue(); // This will now go to Step 2
  };

  const canContinue = croppedImage && localSelectedStyle;

  return (
    <div className="space-y-8">
      {/* Step Title */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Upload Your Photo & Choose Style
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Upload your favorite photo and select an artistic style to transform it into a beautiful canvas print.
        </p>
      </div>

      {/* Photo Upload Section */}
      {(!croppedImage || showRecrop) ? (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <Upload className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {showRecrop ? "Re-crop Your Photo" : "Start with Your Photo"}
            </h3>
            <p className="text-gray-600">
              {showRecrop ? "Adjust your crop to get the perfect composition" : "Upload a high-quality image to transform into art"}
            </p>
          </div>
          <PhotoUpload 
            onImageUpload={handlePhotoUpload} 
            initialImage={showRecrop ? originalImage : undefined}
          />
          
          {showRecrop && (
            <div className="text-center mt-4">
              <Button
                variant="outline"
                onClick={() => setShowRecrop(false)}
                className="text-gray-600 border-gray-300"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Photo Preview with Re-crop Option */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Your Photo</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRecropClick}
                className="text-purple-600 border-purple-200 hover:bg-purple-50"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Re-crop Image
              </Button>
            </div>
            <div className="relative w-32 h-32 mx-auto rounded-lg overflow-hidden bg-gray-100">
              <img 
                src={croppedImage} 
                alt="Cropped preview" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Style Selection Grid */}
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Choose Your Artistic Style</h3>
              <p className="text-gray-600">Select a style to see how your photo will look as a canvas print</p>
            </div>
            
            <StyleGrid
              croppedImage={croppedImage}
              selectedStyle={localSelectedStyle?.id || null}
              selectedOrientation={selectedOrientation}
              onStyleSelect={handleStyleSelect}
              onComplete={handleStyleGridContinue}
            />
          </div>

          {/* Continue Button - Only show if both photo and style are selected */}
          {canContinue && (
            <div className="flex justify-center pt-6">
              <Button
                onClick={handleStyleGridContinue}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Continue to Layout & Size
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PhotoUploadAndStyleSelection;
