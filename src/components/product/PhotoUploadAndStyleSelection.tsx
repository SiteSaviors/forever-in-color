
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

  return (
    <div className="space-y-8">
      <PhotoUpload />
      
      {croppedImage && (
        <StyleGrid
          selectedStyle={selectedStyle}
          autoGenerationComplete={autoGenerationComplete}
          onStyleSelect={onComplete}
        />
      )}
    </div>
  );
};

export default PhotoUploadAndStyleSelection;
