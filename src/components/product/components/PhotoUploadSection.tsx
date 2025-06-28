
import PhotoUploadContainer from "../photo-upload/PhotoUploadContainer";

interface PhotoUploadSectionProps {
  hasImage: boolean;
  croppedImage: string | null;
  onImageUpload: (imageUrl: string, originalImageUrl?: string, orientation?: string) => void;
  onFileInputTriggerReady?: (triggerFn: () => boolean) => void;
}

const PhotoUploadSection = ({
  hasImage,
  croppedImage,
  onImageUpload,
  onFileInputTriggerReady
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
      />
    </div>
  );
};

export default PhotoUploadSection;
