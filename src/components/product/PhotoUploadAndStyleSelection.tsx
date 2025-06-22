
import { useState } from "react";
import { Sparkles } from "lucide-react";
import PhotoUpload from "./PhotoUpload";
import PhotoCropper from "./PhotoCropper";
import StyleSelector from "./StyleSelector";

interface PhotoUploadAndStyleSelectionProps {
  onComplete: (imageUrl: string, styleId: number, styleName: string) => void;
  preSelectedStyle?: {id: number, name: string} | null;
}

const PhotoUploadAndStyleSelection = ({ onComplete, preSelectedStyle }: PhotoUploadAndStyleSelectionProps) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<number | null>(preSelectedStyle?.id || null);
  const [showCrop, setShowCrop] = useState(false);
  const [finalCroppedImage, setFinalCroppedImage] = useState<string | null>(null);

  const handleFileSelect = (file: File, previewUrl: string) => {
    setUploadedFile(file);
    setPreviewUrl(previewUrl);
    setShowCrop(true);
  };

  const handleCropComplete = (croppedImage: string) => {
    setFinalCroppedImage(croppedImage);
    setShowCrop(false);
  };

  const handleSkipCrop = () => {
    setFinalCroppedImage(previewUrl);
    setShowCrop(false);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setFinalCroppedImage(null);
    setSelectedStyle(null);
    setShowCrop(false);
  };

  const handleStyleSelect = (styleId: number, styleName: string) => {
    setSelectedStyle(styleId);
  };

  const handleComplete = (imageUrl: string, styleId: number, styleName: string) => {
    onComplete(imageUrl, styleId, styleName);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h3 className="text-2xl font-semibold text-gray-900 flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          Upload Your Photo & See It Come to Life
        </h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {!uploadedFile ? 
            "See all our amazing art styles below, then upload your photo to watch the magic happen!" :
            showCrop ? "Perfect your photo with our cropping tool, then see it transformed!" :
            "Amazing! Now see how your photo looks in different artistic styles."
          }
        </p>
      </div>

      {/* Upload Section */}
      {showCrop ? (
        <PhotoCropper
          imageUrl={previewUrl!}
          onCropComplete={handleCropComplete}
          onSkip={handleSkipCrop}
        />
      ) : (
        <PhotoUpload
          onFileSelect={handleFileSelect}
          uploadedFile={uploadedFile}
          previewUrl={finalCroppedImage}
          onRemoveFile={handleRemoveFile}
        />
      )}

      {/* Style Selection */}
      {!showCrop && (
        <StyleSelector
          croppedImage={finalCroppedImage}
          selectedStyle={selectedStyle}
          preSelectedStyle={preSelectedStyle}
          onStyleSelect={handleStyleSelect}
          onComplete={handleComplete}
        />
      )}

      {/* Upload Tips */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h4 className="font-semibold text-blue-900 mb-3">💡 Tips for Best Results</h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Use high-resolution photos (at least 1000x1000px)</li>
          <li>• Ensure good lighting and clear focal points</li>
          <li>• Avoid heavily filtered or edited photos</li>
          <li>• Group photos work best with 2-4 people</li>
        </ul>
      </div>
    </div>
  );
};

export default PhotoUploadAndStyleSelection;
