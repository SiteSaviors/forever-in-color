
import PhotoUpload from "./PhotoUpload";
import StyleGrid from "./StyleGrid";
import { useStylePreview } from "./contexts/StylePreviewContext";

interface PhotoUploadAndStyleSelectionProps {
  selectedStyle: {id: number, name: string} | null;
  autoGenerationComplete: boolean;
  onComplete: (imageUrl: string, styleId: number, styleName: string) => void;
}

const PhotoUploadAndStyleSelection = ({
  selectedStyle,
  autoGenerationComplete,
  onComplete
}: PhotoUploadAndStyleSelectionProps) => {
  const { croppedImage } = useStylePreview();

  const handleImageUpload = (imageUrl: string) => {
    console.log('Image uploaded:', imageUrl);
  };

  const handleStyleSelect = (styleId: number, styleName: string) => {
    if (croppedImage) {
      onComplete(croppedImage, styleId, styleName);
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
