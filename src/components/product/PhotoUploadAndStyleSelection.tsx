
import { useState } from "react";
import PhotoUpload from "./PhotoUpload";
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
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<number | null>(
    preSelectedStyle?.id || null
  );

  const handlePhotoUpload = (imageUrl: string) => {
    console.log('Photo uploaded:', imageUrl);
    setUploadedImage(imageUrl);
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
          onUpload={handlePhotoUpload}
          uploadedImage={uploadedImage}
        />
      </div>

      {/* Style Selection Section */}
      <div>
        <StyleSelector
          croppedImage={uploadedImage}
          selectedStyle={selectedStyle}
          preSelectedStyle={preSelectedStyle}
          onStyleSelect={handleStyleSelect}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
};

export default PhotoUploadAndStyleSelection;
