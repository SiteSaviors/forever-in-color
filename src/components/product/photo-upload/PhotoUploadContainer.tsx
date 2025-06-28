import { useState, useEffect, useCallback } from "react";
import { detectOrientationFromImage } from "../utils/orientationDetection";
import { useGlobalFileUpload } from "../hooks/useGlobalFileUpload";
import UnifiedFlowProgress from "../components/UnifiedFlowProgress";
import AutoCropPreview from "../components/AutoCropPreview";
import PhotoCropper from "../PhotoCropper";
import PhotoUploadMain from "./components/PhotoUploadMain";
import { Card, CardContent } from "@/components/ui/card";

interface PhotoUploadContainerProps {
  onImageUpload: (imageUrl: string, originalImageUrl?: string, orientation?: string) => void;
  initialImage?: string | null;
  onTriggerReady?: (triggerFn: () => boolean) => void;
}

const PhotoUploadContainer = ({ onImageUpload, initialImage, onTriggerReady }: PhotoUploadContainerProps) => {
  const [showCropper, setShowCropper] = useState(false);
  const [showAutoCropPreview, setShowAutoCropPreview] = useState(false);
  const [recommendedOrientation, setRecommendedOrientation] = useState<string>("");
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [cropAccepted, setCropAccepted] = useState(false);
  const [currentFlowStage, setCurrentFlowStage] = useState<'upload' | 'analyzing' | 'crop-preview' | 'orientation' | 'complete'>('upload');
  const [uploadedImage, setUploadedImage] = useState<string | null>(initialImage || null);

  const handleImageAnalysis = async (imageUrl: string) => {
    console.log('🎯 PhotoUploadContainer: Starting image analysis for:', imageUrl);
    setUploadedImage(imageUrl);
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
      console.error('Error analyzing image:', error);
      setRecommendedOrientation('square');
      setAnalysisComplete(true);
      setCurrentFlowStage('crop-preview');
      setShowAutoCropPreview(true);
    }
  };

  const {
    isUploading,
    uploadProgress,
    processingStage,
    triggerFileInput
  } = useGlobalFileUpload({
    onImageUpload,
    onImageAnalysis: handleImageAnalysis,
    onFlowStageChange: setCurrentFlowStage
  });

  // Register the trigger function immediately when component mounts
  useEffect(() => {
    console.log('🎯 PhotoUploadContainer: Registering global trigger function');
    onTriggerReady?.(triggerFileInput);
  }, [triggerFileInput, onTriggerReady]);

  // Update uploadedImage and flow when initialImage changes
  useEffect(() => {
    if (initialImage) {
      setUploadedImage(initialImage);
      setCurrentFlowStage('analyzing');
      handleImageAnalysis(initialImage);
    }
  }, [initialImage]);

  const handleAcceptAutoCrop = (croppedImageUrl: string) => {
    console.log('✅ Accepting auto crop with URL:', croppedImageUrl);
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
    console.log('Custom crop completed:', { croppedImage, aspectRatio, orientation });
    setCropAccepted(true);
    setCurrentFlowStage('complete');
    onImageUpload(croppedImage, uploadedImage || undefined, orientation);
    setShowCropper(false);
  };

  const handleChangePhoto = () => {
    console.log('🎯 User wants to change photo - triggering global file input');
    triggerFileInput();
  };

  // Simplified drag and drop handlers for the UI (still functional but uses global system)
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    console.log('🎯 File dropped - but using global system handles file processing');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleClick = () => {
    console.log('🎯 Upload area clicked - triggering global file input');
    triggerFileInput();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // This is handled by the global system now, but keeping for UI compatibility
    console.log('🎯 File input change - handled by global system');
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
        isDragOver={false}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        processingStage={processingStage}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        onFileChange={handleFileChange}
      />
    </div>
  );
};

export default PhotoUploadContainer;
