
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
  const [cropAspectRatio, setCropAspectRatio] = useState<number>(1); // Track crop aspect ratio

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
    setCropAspectRatio(1); // Reset aspect ratio
  };

  const handleCropComplete = (croppedImageUrl: string, aspectRatio: number) => {
    console.log('Crop completed:', croppedImageUrl, 'Aspect ratio:', aspectRatio);
    setCroppedImage(croppedImageUrl);
    setCropAspectRatio(aspectRatio);
    setShowCropper(false);
  };

  const handleSkipCrop = () => {
    console.log('Skipping crop, using original image');
    setCroppedImage(previewUrl);
    setCropAspectRatio(1); // Default to square for original image
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

  // Handle orientation change from cropper
  const handleOrientationChange = (newAspectRatio: number) => {
    console.log('Orientation changed to aspect ratio:', newAspectRatio);
    setCropAspectRatio(newAspectRatio);
  };

  // Allow users to re-crop their image with a different orientation
  const handleRecropImage = () => {
    console.log('Recropping image with current aspect ratio:', cropAspectRatio);
    setShowCropper(true);
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

      {/* Photo Cropper Section - Show when image is uploaded but not yet cropped OR when user wants to recrop */}
      {showCropper && previewUrl && (
        <div>
          <div className="text-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Perfect Your Photo (Optional but Recommended)
            </h3>
            <p className="text-gray-600">
              Choose your crop orientation and adjust your photo to highlight the most important parts. You can change orientation anytime!
            </p>
          </div>
          <PhotoCropper
            imageUrl={previewUrl}
            initialAspectRatio={cropAspectRatio}
            onCropComplete={handleCropComplete}
            onSkip={handleSkipCrop}
            onOrientationChange={handleOrientationChange}
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
            cropAspectRatio={cropAspectRatio}
            onStyleSelect={handleStyleSelect}
            onComplete={handleComplete}
            onRecropImage={handleRecropImage}
          />
        </div>
      )}
    </div>
  );
};

export default PhotoUploadAndStyleSelection;
