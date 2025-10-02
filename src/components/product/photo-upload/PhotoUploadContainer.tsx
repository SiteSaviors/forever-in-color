
import { useState, useEffect, memo } from "react";
import { detectOrientationFromImage } from "../utils/orientationDetection";
import { usePhotoUploadLogic } from "./hooks/usePhotoUploadLogic";
import UnifiedFlowProgress from "../components/UnifiedFlowProgress";
import AutoCropPreview from "../components/AutoCropPreview";
import PhotoCropper from "../PhotoCropper";
import PhotoUploadMain from "./components/PhotoUploadMain";
import { Card, CardContent } from "@/components/ui/card";

interface PhotoUploadContainerProps {
  onImageUpload: (imageUrl: string, originalImageUrl?: string, orientation?: string) => void;
  initialImage?: string | null;
}

const PhotoUploadContainer = memo(({ onImageUpload, initialImage }: PhotoUploadContainerProps) => {
  const [showCropper, setShowCropper] = useState(false);
  const [showAutoCropPreview, setShowAutoCropPreview] = useState(false);
  const [recommendedOrientation, setRecommendedOrientation] = useState<string>("");
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [cropAccepted, setCropAccepted] = useState(false);
  const [currentFlowStage, setCurrentFlowStage] = useState<'upload' | 'analyzing' | 'crop-preview' | 'orientation' | 'complete'>('upload');

  const handleImageAnalysis = async (imageUrl: string) => {
    setCurrentFlowStage('analyzing');
    
    try {
      const orientation = await detectOrientationFromImage(imageUrl);
      setRecommendedOrientation(orientation);
      
      setTimeout(() => {
        setAnalysisComplete(true);
        setCurrentFlowStage('crop-preview');
        setShowAutoCropPreview(true);
      }, 1500);
    } catch (error) {
      setRecommendedOrientation('square');
      setAnalysisComplete(true);
      setCurrentFlowStage('crop-preview');
      setShowAutoCropPreview(true);
    }
  };

  const {
    isDragOver,
    isUploading,
    uploadProgress,
    uploadedImage,
    processingStage,
    fileInputRef,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleClick,
    handleFileChange,
    handleChangePhoto,
    setUploadedImage
  } = usePhotoUploadLogic({
    onImageUpload,
    initialImage,
    onImageAnalysis: handleImageAnalysis,
    onFlowStageChange: setCurrentFlowStage
  });

  // Update uploadedImage and flow when initialImage changes
  useEffect(() => {
    if (initialImage) {
      setUploadedImage(initialImage);
      setCurrentFlowStage('analyzing');
      handleImageAnalysis(initialImage);
    }
  }, [initialImage]);

  const handleAcceptAutoCrop = (croppedImageUrl: string) => {
    setCropAccepted(true);
    setCurrentFlowStage('complete');
    setShowAutoCropPreview(false);
    
    // Pass the cropped image URL as the main image
    onImageUpload(croppedImageUrl, uploadedImage || undefined, recommendedOrientation);
  };

  const handleCustomizeCrop = () => {
    setShowAutoCropPreview(false);
    setShowCropper(true);
    setCurrentFlowStage('orientation');
  };

  const handleCropComplete = (croppedImage: string, aspectRatio: number, orientation: string) => {
    setCropAccepted(true);
    setCurrentFlowStage('complete');
    onImageUpload(croppedImage, uploadedImage || undefined, orientation);
    setShowCropper(false);
  };

  // Show auto-crop preview after analysis
  if (showAutoCropPreview && uploadedImage) {
    return (
      <div className="space-y-6">
        <UnifiedFlowProgress
          currentStage={currentFlowStage}
          hasImage={!!uploadedImage}
          analysisComplete={analysisComplete}
          cropAccepted={cropAccepted}
          orientationSelected={false}
        />
        
        <AutoCropPreview
          imageUrl={uploadedImage}
          onAcceptCrop={handleAcceptAutoCrop}
          onCustomizeCrop={handleCustomizeCrop}
          recommendedOrientation={recommendedOrientation}
        />
      </div>
    );
  }

  // Show custom cropper if user wants to adjust
  if (showCropper && uploadedImage) {
    return (
      <div className="space-y-6">
        <UnifiedFlowProgress
          currentStage={currentFlowStage}
          hasImage={!!uploadedImage}
          analysisComplete={analysisComplete}
          cropAccepted={cropAccepted}
          orientationSelected={false}
        />
        
        <Card className="w-full overflow-hidden">
          <CardContent className="p-0">
            <PhotoCropper
              imageUrl={uploadedImage}
              onCropComplete={handleCropComplete}
              onChangePhoto={handleChangePhoto}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Show progress if we have an image */}
      {uploadedImage && (
        <UnifiedFlowProgress
          currentStage={currentFlowStage}
          hasImage={!!uploadedImage}
          analysisComplete={analysisComplete}
          cropAccepted={cropAccepted}
          orientationSelected={false}
        />
      )}

      <PhotoUploadMain
        isDragOver={isDragOver}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        processingStage={processingStage}
        fileInputRef={fileInputRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        onFileChange={handleFileChange}
      />
    </div>
  );
});

PhotoUploadContainer.displayName = 'PhotoUploadContainer';

export default PhotoUploadContainer;
