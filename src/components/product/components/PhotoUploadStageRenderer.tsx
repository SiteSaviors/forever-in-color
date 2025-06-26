
import PhotoUploadSection from "./PhotoUploadSection";
import AIAnalysisStatus from "./intelligence/AIAnalysisStatus";
import AutoCropPreview from "./AutoCropPreview";
import PhotoCropperSection from "./PhotoCropperSection";
import StyleSelectionSection from "./StyleSelectionSection";

interface PhotoUploadStageRendererProps {
  stageConfig: {
    shouldShowUpload: boolean;
    shouldShowAnalysis: boolean;
    shouldShowAutoCrop: boolean;
    shouldShowCropper: boolean;
    shouldShowStyleSelection: boolean;
  };
  
  // Upload stage props
  hasImage: boolean;
  croppedImage: string | null;
  onImageUpload: (imageUrl: string, originalImageUrl?: string, orientation?: string) => void;
  
  // Analysis stage props
  isAnalyzing: boolean;
  
  // Auto crop stage props
  uploadedImage: string | null;
  recommendedOrientation: string;
  onAcceptAutoCrop: (croppedImageUrl: string) => void;
  onCustomizeAutoCrop: () => void;
  
  // Cropper stage props
  showCropper: boolean;
  originalImage: string | null;
  currentOrientation: string;
  onCropComplete: (croppedImageUrl: string) => void;
  onOrientationChange: (orientation: string) => void;
  
  // Style selection props
  selectedStyle: { id: number; name: string } | null;
  cropAspectRatio: number;
  onStyleSelect: (styleId: number, styleName: string) => void;
  onStyleComplete: (imageUrl: string, styleId: number, styleName: string) => void;
  onRecropImage: () => void;
}

const PhotoUploadStageRenderer = ({
  stageConfig,
  hasImage,
  croppedImage,
  onImageUpload,
  isAnalyzing,
  uploadedImage,
  recommendedOrientation,
  onAcceptAutoCrop,
  onCustomizeAutoCrop,
  showCropper,
  originalImage,
  currentOrientation,
  onCropComplete,
  onOrientationChange,
  selectedStyle,
  cropAspectRatio,
  onStyleSelect,
  onStyleComplete,
  onRecropImage
}: PhotoUploadStageRendererProps) => {
  return (
    <>
      {/* Photo Upload Section - Only show if no image uploaded yet */}
      {stageConfig.shouldShowUpload && (
        <PhotoUploadSection
          hasImage={hasImage}
          croppedImage={croppedImage}
          onImageUpload={onImageUpload}
        />
      )}

      {/* AI Analysis Status - Show immediately when image is uploaded and being analyzed */}
      {stageConfig.shouldShowAnalysis && (
        <AIAnalysisStatus isAnalyzing={isAnalyzing} />
      )}

      {/* Auto Crop Preview - Show after analysis completes */}
      {stageConfig.shouldShowAutoCrop && (
        <AutoCropPreview
          imageUrl={uploadedImage}
          onAcceptCrop={onAcceptAutoCrop}
          onCustomizeCrop={onCustomizeAutoCrop}
          recommendedOrientation={recommendedOrientation}
        />
      )}

      {/* Manual Photo Cropper - Show when user wants to customize crop */}
      {stageConfig.shouldShowCropper && (
        <PhotoCropperSection
          showCropper={showCropper}
          originalImage={originalImage}
          currentOrientation={currentOrientation}
          onCropComplete={onCropComplete}
          onOrientationChange={onOrientationChange}
        />
      )}

      {/* Style Selection Section - Only show after image processing is complete */}
      {stageConfig.shouldShowStyleSelection && (
        <StyleSelectionSection
          hasImage={hasImage}
          croppedImage={croppedImage}
          selectedStyle={selectedStyle}
          cropAspectRatio={cropAspectRatio}
          selectedOrientation={currentOrientation}
          onStyleSelect={onStyleSelect}
          onStyleComplete={onStyleComplete}
          onRecropImage={onRecropImage}
        />
      )}
    </>
  );
};

export default PhotoUploadStageRenderer;
