
import PhotoUpload from "./PhotoUpload";
import StyleGrid from "./StyleGrid";
import { useStylePreview } from "./contexts/StylePreviewContext";

interface PhotoUploadAndStyleSelectionProps {
  selectedStyle: {id: number, name: string} | null;
  uploadedImage?: string | null; // Add this missing prop
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

  const handleImageUpload = (imageUrl: string) => {
    console.log('Image uploaded:', imageUrl);
  };

  const handleStyleSelect = (styleId: number, styleName: string) => {
    if (croppedImage) {
      onComplete(croppedImage, styleId, styleName);
      if (onPhotoAndStyleComplete) {
        onPhotoAndStyleComplete(croppedImage, styleId, styleName);
      }
    }
  };

  return (
    <div className="space-y-8">
      <PhotoUpload onImageUpload={handleImageUpload} />
      
      {croppedImage && (
        <StyleGrid
          croppedImage={croppedImage}
          selectedStyle={selectedStyle?.id || null}
          onStyleSelect={handleStyleSelect}
          onComplete={() => {}}
        />
      )}
    </div>
  );
};

export default PhotoUploadAndStyleSelection;
