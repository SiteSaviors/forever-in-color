
import PhotoUpload from "../PhotoUpload";

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
  if (hasImage) return null;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-gray-600">
          Upload your photo and select your canvas orientation in one seamless step.
        </p>
      </div>
      
      <PhotoUpload onImageUpload={onImageUpload} initialImage={croppedImage} />
    </div>
  );
};

export default PhotoUploadSection;
