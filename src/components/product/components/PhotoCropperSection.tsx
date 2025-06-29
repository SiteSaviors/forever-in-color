
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
  if (!showCropper || !originalImage) return null;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Adjust Your Photo</h3>
        <p className="text-gray-600">
          Crop and adjust your photo to get the perfect composition
        </p>
      </div>
      
      <PhotoCropper
        imageUrl={originalImage}
        initialAspectRatio={currentOrientation === 'vertical' ? 3/4 : currentOrientation === 'horizontal' ? 4/3 : 1}
        selectedOrientation={currentOrientation}
        onCropComplete={onCropComplete}
        onOrientationChange={onOrientationChange}
      />
    </div>
  );
};

export default PhotoCropperSection;
