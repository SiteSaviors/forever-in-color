
import StyleSelector from "../StyleSelector";

interface StyleSelectionSectionProps {
  hasImage: boolean;
  croppedImage: string | null;
  selectedStyle: { id: number; name: string } | null;
  cropAspectRatio: number;
  selectedOrientation: string;
  onStyleSelect: (styleId: number, styleName: string) => void;
  onStyleComplete: (imageUrl: string, styleId: number, styleName: string) => void;
  onRecropImage: () => void;
}

const StyleSelectionSection = ({
  hasImage,
  croppedImage,
  selectedStyle,
  cropAspectRatio,
  selectedOrientation,
  onStyleSelect,
  onStyleComplete,
  onRecropImage
}: StyleSelectionSectionProps) => {
  if (!hasImage) return null;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Art Style</h3>
        <p className="text-gray-600">
          Select the artistic style that best matches your vision
        </p>
      </div>
      
      <StyleSelector 
        croppedImage={croppedImage} 
        selectedStyle={selectedStyle?.id || null} 
        cropAspectRatio={cropAspectRatio}
        selectedOrientation={selectedOrientation}
        onStyleSelect={onStyleSelect} 
        onComplete={onStyleComplete}
        onRecropImage={onRecropImage}
      />
    </div>
  );
};

export default StyleSelectionSection;
