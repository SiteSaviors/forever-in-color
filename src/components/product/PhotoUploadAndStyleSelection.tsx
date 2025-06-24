
import PhotoUpload from "./PhotoUpload";
import StyleGrid from "./StyleGrid";
import { useStylePreview } from "./contexts/StylePreviewContext";

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
    // This will cause the parent to set uploadedImage and advance to the next step
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

  return (
    <div className="space-y-8">
      {!currentImage && (
        <PhotoUpload onImageUpload={handleImageUpload} />
      )}
      
      {currentImage && (
        <StyleGrid
          croppedImage={currentImage}
          selectedStyle={selectedStyle?.id || null}
          onStyleSelect={handleStyleSelect}
          onComplete={() => {}}
        />
      )}
    </div>
  );
};

export default PhotoUploadAndStyleSelection;
