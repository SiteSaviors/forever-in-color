
import PhotoUploadContainer from "../photo-upload/PhotoUploadContainer";

interface PhotoUploadSectionProps {
  hasImage: boolean;
  croppedImage: string | null;
  onImageUpload: (imageUrl: string, originalImageUrl?: string, orientation?: string) => void;
}

const PhotoUploadSection = ({
  hasImage,
  croppedImage,
  onImageUpload
}: PhotoUploadSectionProps) => {
  // Only show the upload interface if no image is present
  if (hasImage && croppedImage) {
    return null;
  }

  return (
    <div className="w-full space-y-3 sm:space-y-4">
      <PhotoUploadContainer 
        onImageUpload={onImageUpload} 
        initialImage={croppedImage} 
      />
    </div>
  );
};

export default PhotoUploadSection;
