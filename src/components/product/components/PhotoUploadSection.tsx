
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
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Photo</h3>
        <p className="text-gray-600">
          Choose a high-quality photo to transform into stunning canvas art
        </p>
      </div>
      
      <PhotoUploadContainer
        onImageUpload={onImageUpload}
        initialImage={croppedImage}
      />
    </div>
  );
};

export default PhotoUploadSection;
