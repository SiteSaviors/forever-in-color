
import { useState, useEffect } from "react";
import PhotoUpload from "./PhotoUpload";
import PhotoCropper from "./PhotoCropper";
import StyleSelector from "./StyleSelector";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Upload, Palette } from "lucide-react";

interface PhotoUploadAndStyleSelectionProps {
  selectedStyle: {
    id: number;
    name: string;
  } | null;
  uploadedImage: string | null;
  selectedOrientation: string;
  autoGenerationComplete: boolean;
  onComplete: (imageUrl: string, styleId: number, styleName: string) => void;
  onPhotoAndStyleComplete: (imageUrl: string, styleId: number, styleName: string) => void;
  onContinue: () => void;
  currentStep: number;
  completedSteps: number[];
  onStepChange: (step: number) => void;
}

const PhotoUploadAndStyleSelection = ({
  selectedStyle,
  uploadedImage,
  selectedOrientation,
  autoGenerationComplete,
  onComplete,
  onPhotoAndStyleComplete,
  onContinue,
  currentStep,
  completedSteps,
  onStepChange
}: PhotoUploadAndStyleSelectionProps) => {
  const [currentOrientation, setCurrentOrientation] = useState(selectedOrientation);
  const [showCropper, setShowCropper] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(uploadedImage);

  // Update local orientation state when prop changes
  useEffect(() => {
    setCurrentOrientation(selectedOrientation);
  }, [selectedOrientation]);

  // Update cropped image when uploadedImage prop changes
  useEffect(() => {
    setCroppedImage(uploadedImage);
  }, [uploadedImage]);

  const handleImageUpload = (imageUrl: string, originalImageUrl?: string, orientation?: string) => {
    console.log('🎨 Photo uploaded with unified canvas selection:', {
      imageUrl,
      orientation
    });

    // Store the original image for potential re-cropping
    setOriginalImage(originalImageUrl || imageUrl);
    setCroppedImage(imageUrl);
    setShowCropper(false);

    // If orientation was selected during cropping, update it
    if (orientation && orientation !== currentOrientation) {
      console.log('🎯 Canvas orientation selected during cropping:', orientation);
      setCurrentOrientation(orientation);
    }

    // Create a temporary style entry for state management
    if (selectedStyle) {
      onPhotoAndStyleComplete(imageUrl, selectedStyle.id, selectedStyle.name);
    } else {
      // Create temporary style to maintain state flow
      onPhotoAndStyleComplete(imageUrl, 0, "temp-style");
    }
  };

  const handleCropComplete = (croppedImageUrl: string, aspectRatio: number, orientation: string) => {
    console.log('🎨 Crop completed:', { croppedImageUrl, aspectRatio, orientation });
    
    setCroppedImage(croppedImageUrl);
    setCurrentOrientation(orientation);
    setShowCropper(false);

    // Update parent with new cropped image
    if (selectedStyle) {
      onPhotoAndStyleComplete(croppedImageUrl, selectedStyle.id, selectedStyle.name);
    } else {
      onPhotoAndStyleComplete(croppedImageUrl, 0, "temp-style");
    }
  };

  const handleRecropImage = () => {
    console.log('🎨 User wants to recrop image');
    setShowCropper(true);
  };

  const handleStyleSelect = (styleId: number, styleName: string) => {
    console.log('🎨 Style selected:', {
      styleId,
      styleName
    });
    if (croppedImage) {
      onPhotoAndStyleComplete(croppedImage, styleId, styleName);
    }
  };

  const handleStyleComplete = (imageUrl: string, styleId: number, styleName: string) => {
    console.log('🎨 Style selection completed:', {
      imageUrl,
      styleId,
      styleName
    });
    onComplete(imageUrl, styleId, styleName);
    onContinue();
  };

  const hasImage = !!croppedImage;
  const hasStyle = selectedStyle && selectedStyle.name !== "temp-style";
  const canContinue = hasImage && hasStyle;

  return (
    <div className="space-y-8">
      {/* Progress Indicators */}
      <div className="flex items-center justify-center gap-8 mb-8">
        <div className={`flex items-center gap-2 ${hasImage ? 'text-green-600' : 'text-gray-400'}`}>
          {hasImage ? <CheckCircle className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
          <span className="font-medium">Photo & Canvas</span>
          {hasImage && (
            <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
              ✓ {currentOrientation} selected
            </Badge>
          )}
        </div>
        
        <div className={`w-8 h-0.5 ${hasImage ? 'bg-green-500' : 'bg-gray-300'}`}></div>
        
        <div className={`flex items-center gap-2 ${hasStyle ? 'text-green-600' : hasImage ? 'text-purple-600' : 'text-gray-400'}`}>
          <Palette className="w-5 h-5" />
          <span className="font-medium">Art Style</span>
          {hasStyle && (
            <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
              ✓ {selectedStyle?.name}
            </Badge>
          )}
        </div>
      </div>

      {/* Show cropper if user wants to recrop */}
      {showCropper && originalImage && (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Adjust Your Photo</h3>
            <p className="text-gray-600">
              Crop and adjust your photo to get the perfect composition
            </p>
          </div>
          
          <PhotoCropper
            imageUrl={originalImage}
            initialAspectRatio={currentOrientation === 'vertical' ? 3/4 : currentOrientation === 'horizontal' ? 4/3 : 1}
            selectedOrientation={currentOrientation}
            onCropComplete={handleCropComplete}
            onOrientationChange={setCurrentOrientation}
          />
        </div>
      )}

      {/* Photo Upload Section - Only show if no image or not showing cropper */}
      {!showCropper && (
        <>
          {!hasImage && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-600">
                  Upload your photo and select your canvas orientation in one seamless step.
                </p>
              </div>
              
              <PhotoUpload onImageUpload={handleImageUpload} initialImage={croppedImage} />
            </div>
          )}

          {/* Style Selection Section - Only show after image is uploaded */}
          {hasImage && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Art Style</h3>
                <p className="text-gray-600">
                  Select the artistic style that best matches your vision
                </p>
              </div>
              
              <StyleSelector 
                croppedImage={croppedImage} 
                selectedStyle={selectedStyle?.id || null} 
                onStyleSelect={handleStyleSelect} 
                onComplete={handleStyleComplete}
                onRecropImage={handleRecropImage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PhotoUploadAndStyleSelection;
