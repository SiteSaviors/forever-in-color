
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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<number | null>(
    preSelectedStyle?.id || null
  );

  const handleFileSelect = (file: File, imageUrl: string) => {
    console.log('File selected:', file.name, imageUrl);
    setUploadedFile(file);
    setPreviewUrl(imageUrl);
  };

  const handleRemoveFile = () => {
    console.log('File removed');
    setUploadedFile(null);
    setPreviewUrl(null);
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

      {/* Style Selection Section */}
      <div>
        <StyleSelector
          croppedImage={previewUrl}
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
