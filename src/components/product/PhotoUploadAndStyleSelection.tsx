
import { useState } from "react";
import PhotoUpload from "./PhotoUpload";
import PhotoCropper from "./PhotoCropper";
import StyleGrid from "./StyleGrid";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface PhotoUploadAndStyleSelectionProps {
  selectedStyle: {id: number, name: string} | null;
  uploadedImage: string | null;
  previewUrls: { [key: number]: string };
  autoGenerationComplete: boolean;
  onPhotoAndStyleComplete: (imageUrl: string, styleId: number, styleName: string) => void;
  onContinue: () => void;
}

const PhotoUploadAndStyleSelection = ({
  selectedStyle,
  uploadedImage,
  previewUrls,
  autoGenerationComplete,
  onPhotoAndStyleComplete,
  onContinue
}: PhotoUploadAndStyleSelectionProps) => {
  const [uploadedImageFile, setUploadedImageFile] = useState<string | null>(uploadedImage);
  const [croppedImage, setCroppedImage] = useState<string | null>(uploadedImage);
  const [selectedStyleId, setSelectedStyleId] = useState<number | null>(selectedStyle?.id || null);
  const [cropAspectRatio, setCropAspectRatio] = useState(1);
  const [showCropper, setShowCropper] = useState(false);

  const handleImageUpload = (imageUrl: string) => {
    console.log('Image uploaded:', imageUrl);
    setUploadedImageFile(imageUrl);
    setCroppedImage(null);
    setShowCropper(true);
  };

  const handleCropComplete = (croppedImageUrl: string, aspectRatio: number) => {
    console.log('Crop completed with aspect ratio:', aspectRatio);
    setCroppedImage(croppedImageUrl);
    setCropAspectRatio(aspectRatio);
    setShowCropper(false);
  };

  const handleStyleSelect = (styleId: number, styleName: string) => {
    console.log('Style selected:', styleId, styleName);
    setSelectedStyleId(styleId);
    
    if (croppedImage) {
      onPhotoAndStyleComplete(croppedImage, styleId, styleName);
    }
  };

  const handleContinue = () => {
    onContinue();
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
            onCropComplete={handleCropComplete}
          />
        </div>
      )}

      {/* Style Selection */}
      {croppedImage && !showCropper && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Choose Your Art Style
          </h3>
          <StyleGrid
            croppedImage={croppedImage}
            selectedStyle={selectedStyleId}
            cropAspectRatio={cropAspectRatio}
            previewUrls={previewUrls}
            autoGenerationComplete={autoGenerationComplete}
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
