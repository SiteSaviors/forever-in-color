
import PhotoUploadContainer from "../photo-upload/PhotoUploadContainer";

interface GlobalUploadState {
  isUploading: boolean;
  uploadProgress: number;
  processingStage: string;
}

interface PhotoUploadSectionProps {
  hasImage: boolean;
  croppedImage: string | null;
  onImageUpload: (imageUrl: string, originalImageUrl?: string, orientation?: string) => void;
  onFileInputTriggerReady?: (triggerFn: () => boolean) => void;
  globalUploadState?: GlobalUploadState;
}

const PhotoUploadSection = ({
  hasImage,
  croppedImage,
  onImageUpload,
  onFileInputTriggerReady,
  globalUploadState
}: PhotoUploadSectionProps) => {
  // Only show the upload interface if no image is present
  if (hasImage && croppedImage) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        
      </div>
      
      <PhotoUploadContainer 
        onImageUpload={onImageUpload} 
        initialImage={croppedImage} 
        onTriggerReady={onFileInputTriggerReady}
        globalUploadState={globalUploadState}
      />
    </div>
  );
};

export default PhotoUploadSection;
