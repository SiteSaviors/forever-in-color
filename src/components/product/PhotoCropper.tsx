
import { useCropperLogic } from "./cropper/useCropperLogic";
import CropperHeader from "./cropper/CropperHeader";
import OrientationOptions from "./cropper/OrientationOptions";
import CropperInterface from "./cropper/CropperInterface";
import CropperActions from "./cropper/CropperActions";

interface PhotoCropperProps {
  imageUrl: string;
  initialAspectRatio?: number;
  selectedOrientation?: string;
  onCropComplete: (croppedImage: string, aspectRatio: number) => void;
  onOrientationChange?: (orientation: string) => void;
}

const PhotoCropper = ({ 
  imageUrl, 
  initialAspectRatio = 1,
  selectedOrientation = "square",
  onCropComplete,
  onOrientationChange 
}: PhotoCropperProps) => {
  const {
    crop,
    zoom,
    cropAspect,
    croppedAreaPixels,
    setCrop,
    setZoom,
    onCropCompleteHandler,
    handleCropSave,
    handleAutoCenterCrop,
    handleOrientationChange
  } = useCropperLogic(selectedOrientation, onCropComplete);

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 md:p-6">
      <div className="space-y-4 md:space-y-6">
        <CropperHeader />

        <OrientationOptions
          cropAspect={cropAspect}
          onOrientationChange={(newAspect, orientationId) => 
            handleOrientationChange(newAspect, orientationId, onOrientationChange)
          }
        />

        <CropperInterface
          imageUrl={imageUrl}
          crop={crop}
          zoom={zoom}
          cropAspect={cropAspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropCompleteHandler}
        />

        <CropperActions
          onAutoCenterCrop={handleAutoCenterCrop}
          onCropSave={() => handleCropSave(imageUrl)}
          disabled={!croppedAreaPixels}
        />
      </div>
    </div>
  );
};

export default PhotoCropper;
