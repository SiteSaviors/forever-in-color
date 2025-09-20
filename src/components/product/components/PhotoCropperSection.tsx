
import PhotoCropper from "../PhotoCropper";

interface PhotoCropperSectionProps {
  showCropper: boolean;
  originalImage: string | null;
  currentOrientation: string;
  onCropComplete: (croppedImageUrl: string, aspectRatio: number, orientation: string) => void;
  onOrientationChange: (orientation: string) => void;
}

const PhotoCropperSection = ({
  showCropper,
  originalImage,
  currentOrientation,
  onCropComplete,
  onOrientationChange
}: PhotoCropperSectionProps) => {
  if (!showCropper || !originalImage) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Perfect Your Crop
        </h3>
        <p className="text-gray-600">
          Adjust the crop area and canvas orientation to showcase your photo beautifully
        </p>
      </div>
      
      <PhotoCropper
        imageUrl={originalImage}
        selectedOrientation={currentOrientation}
        onCropComplete={onCropComplete}
        onOrientationChange={onOrientationChange}
      />
    </div>
  );
};

export default PhotoCropperSection;
