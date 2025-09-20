
import PhotoUploadContainer from "./photo-upload/PhotoUploadContainer";

interface PhotoUploadProps {
  onImageUpload: (imageUrl: string, originalImageUrl?: string, orientation?: string) => void;
  initialImage?: string | null;
}

const PhotoUpload = ({ onImageUpload, initialImage }: PhotoUploadProps) => {
  return (
    <PhotoUploadContainer 
      onImageUpload={onImageUpload} 
      initialImage={initialImage} 
    />
  );
};

export default PhotoUpload;
