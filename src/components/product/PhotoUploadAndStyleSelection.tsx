
import { useState } from "react";
import PhotoUpload from "./PhotoUpload";
import PhotoCropper from "./PhotoCropper";
import StyleSelector from "./StyleSelector";
import { artStyles } from "@/data/artStyles";

interface PhotoUploadAndStyleSelectionProps {
  onComplete: (imageUrl: string, styleId: number, styleName: string) => void;
  preSelectedStyle?: {id: number, name: string} | null;
}

const PhotoUploadAndStyleSelection = ({ 
  onComplete, 
  preSelectedStyle 
}: PhotoUploadAndStyleSelectionProps) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<number | null>(
    preSelectedStyle?.id || null
  );

  const handleFileSelect = (file: File, imageUrl: string) => {
    console.log('File selected:', file.name, imageUrl);
    setUploadedFile(file);
    setPreviewUrl(imageUrl);
    setShowCropper(true); // Show cropper after file upload
    setCroppedImage(null); // Reset cropped image
  };

  const handleRemoveFile = () => {
    console.log('File removed');
    setUploadedFile(null);
    setPreviewUrl(null);
    setCroppedImage(null);
    setShowCropper(false);
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    console.log('Crop completed:', croppedImageUrl);
    setCroppedImage(croppedImageUrl);
    setShowCropper(false);
  };

  const handleSkipCrop = () => {
    console.log('Skipping crop, using original image');
    setCroppedImage(previewUrl);
    setShowCropper(false);
  };

  const handleStyleSelect = (styleId: number, styleName: string) => {
    console.log('Style selected:', styleId, styleName);
    setSelectedStyle(styleId);
  };

  const handleComplete = (imageUrl: string, styleId: number, styleName: string) => {
    console.log('PhotoUploadAndStyleSelection handleComplete called with:', { imageUrl, styleId, styleName });
    onComplete(imageUrl, styleId, styleName);
  };

  return (
    <div className="space-y-8">
      {/* Photo Upload Section */}
      <div>
        <PhotoUpload 
          onFileSelect={handleFileSelect}
          uploadedFile={uploadedFile}
          previewUrl={previewUrl}
          onRemoveFile={handleRemoveFile}
        />
      </div>

      {/* Photo Cropper Section - Show when image is uploaded but not yet cropped */}
      {showCropper && previewUrl && (
        <div>
          <div className="text-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Perfect Your Photo (Optional but Recommended)
            </h3>
            <p className="text-gray-600">
              Crop your photo to highlight the most important parts. This step is optional - you can skip if you're happy with the full image.
            </p>
          </div>
          <PhotoCropper
            imageUrl={previewUrl}
            onCropComplete={handleCropComplete}
            onSkip={handleSkipCrop}
          />
        </div>
      )}

      {/* Style Selection Section - Show when we have a cropped image (or skipped cropping) */}
      {(croppedImage || (uploadedFile && !showCropper)) && (
        <div>
          <StyleSelector
            croppedImage={croppedImage || previewUrl}
            selectedStyle={selectedStyle}
            preSelectedStyle={preSelectedStyle}
            onStyleSelect={handleStyleSelect}
            onComplete={handleComplete}
          />
        </div>
      )}
    </div>
  );
};

export default PhotoUploadAndStyleSelection;
