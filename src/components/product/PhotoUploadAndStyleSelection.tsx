
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
    console.log('Image uploaded:', imageUrl);
    // The parent component should handle setting the uploaded image
    // This will trigger a re-render with the new uploadedImage prop
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
      <PhotoUpload onImageUpload={handleImageUpload} />
      
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
