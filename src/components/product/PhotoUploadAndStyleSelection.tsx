
import { useState } from "react";
import PhotoUpload from "./PhotoUpload";
import PhotoCropper from "./PhotoCropper";
import StyleGrid from "./StyleGrid";
import { Button } from "@/components/ui/button";
import { ArrowRight, RotateCcw } from "lucide-react";

interface PhotoUploadAndStyleSelectionProps {
  selectedStyle: {id: number, name: string} | null;
  uploadedImage: string | null;
  selectedOrientation: string;
  previewUrls: { [key: number]: string };
  autoGenerationComplete: boolean;
  onPhotoAndStyleComplete: (imageUrl: string, styleId: number, styleName: string) => void;
  onContinue: () => void;
}

const PhotoUploadAndStyleSelection = ({
  selectedStyle,
  uploadedImage,
  selectedOrientation,
  onPhotoAndStyleComplete,
  onContinue
}: PhotoUploadAndStyleSelectionProps) => {
  const [uploadedImageFile, setUploadedImageFile] = useState<string | null>(uploadedImage);
  const [croppedImage, setCroppedImage] = useState<string | null>(uploadedImage);
  const [selectedStyleId, setSelectedStyleId] = useState<number | null>(selectedStyle?.id || null);
  const [selectedStyleName, setSelectedStyleName] = useState<string | null>(selectedStyle?.name || null);
  const [cropAspectRatio, setCropAspectRatio] = useState(1);
  const [showCropper, setShowCropper] = useState(false);
  const [currentOrientation, setCurrentOrientation] = useState<string>(selectedOrientation);

  const handleImageUpload = (imageUrl: string) => {
    console.log('📷 Image uploaded:', imageUrl);
    setUploadedImageFile(imageUrl);
    setCroppedImage(null);
    setShowCropper(true);
  };

  const handleCropComplete = (croppedImageUrl: string, aspectRatio: number) => {
    console.log('✂️ Crop completed with aspect ratio:', aspectRatio, 'and orientation:', currentOrientation);
    setCroppedImage(croppedImageUrl);
    setCropAspectRatio(aspectRatio);
    setShowCropper(false);
  };

  const handleOrientationChangeInCropper = (newOrientation: string) => {
    console.log('🔄 Orientation changed in cropper to:', newOrientation);
    setCurrentOrientation(newOrientation);
    // Clear existing style selections since orientation changed
    setSelectedStyleId(null);
    setSelectedStyleName(null);
  };

  const handleStyleSelect = (styleId: number, styleName: string) => {
    console.log('🎨 Style selected:', styleId, styleName, 'with orientation:', currentOrientation);
    setSelectedStyleId(styleId);
    setSelectedStyleName(styleName);
  };

  const handleContinue = () => {
    if (croppedImage && selectedStyleId && selectedStyleName) {
      console.log('✅ Completing photo and style selection with orientation:', currentOrientation);
      onPhotoAndStyleComplete(croppedImage, selectedStyleId, selectedStyleName);
    }
    onContinue();
  };

  const handleRecrop = () => {
    setShowCropper(true);
    setCroppedImage(null);
    setSelectedStyleId(null);
    setSelectedStyleName(null);
  };

  const canContinue = croppedImage && selectedStyleId;

  return (
    <div className="space-y-8">
      {/* Photo Upload Section */}
      {!uploadedImageFile && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Upload Your Photo
          </h3>
          <PhotoUpload onImageUpload={handleImageUpload} />
        </div>
      )}

      {/* Photo Cropper */}
      {uploadedImageFile && showCropper && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Crop Your Photo
          </h3>
          <PhotoCropper
            imageUrl={uploadedImageFile}
            selectedOrientation={currentOrientation}
            onCropComplete={handleCropComplete}
            onOrientationChange={handleOrientationChangeInCropper}
          />
        </div>
      )}

      {/* Orientation & Recrop Options */}
      {croppedImage && !showCropper && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <span className="text-blue-600 font-medium">
                {currentOrientation === 'vertical' ? '📱' : currentOrientation === 'horizontal' ? '🖼️' : '⬜'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Current orientation: {currentOrientation.charAt(0).toUpperCase() + currentOrientation.slice(1)}
              </p>
              <p className="text-xs text-gray-600">
                Your photo is cropped and ready for styling
              </p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRecrop}
            className="bg-white hover:bg-blue-50 border-blue-300 text-blue-700 flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Change Crop
          </Button>
        </div>
      )}

      {/* Style Selection - Now using centralized context */}
      {croppedImage && !showCropper && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Choose Your Art Style
          </h3>
          <StyleGrid
            croppedImage={croppedImage}
            selectedStyle={selectedStyleId}
            selectedOrientation={currentOrientation}
            onStyleSelect={handleStyleSelect}
            onComplete={handleContinue}
          />
        </div>
      )}

      {/* Continue Button */}
      {canContinue && (
        <div className="flex justify-center pt-6">
          <Button
            onClick={handleContinue}
            size="lg"
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
          >
            Continue to Canvas Size
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default PhotoUploadAndStyleSelection;
