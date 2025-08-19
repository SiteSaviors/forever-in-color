
import { useEffect } from "react";
import CropperHeader from "./cropper/components/CropperHeader";
import OrientationSelector from "./cropper/components/OrientationSelector";
import CropArea from "./cropper/components/CropArea";
import CropperActions from "./cropper/components/CropperActions";
import { useCropState } from "./cropper/hooks/useCropState";
import { useImageProcessing } from "./cropper/hooks/useImageProcessing";
import { orientationOptions } from "./cropper/data/orientationOptions";

interface PhotoCropperProps {
  imageUrl: string;
  initialAspectRatio?: number;
  selectedOrientation?: string;
  onCropComplete: (croppedImage: string, aspectRatio: number, orientation: string) => void;
  onOrientationChange?: (orientation: string) => void;
  onChangePhoto?: () => void;
}

const PhotoCropper = ({
  imageUrl,
  initialAspectRatio = 1,
  selectedOrientation = "square",
  onCropComplete,
  onOrientationChange,
  onChangePhoto
}: PhotoCropperProps) => {
  const {
    crop,
    zoom,
    cropAspect,
    croppedAreaPixels,
    recommendedOrientation,
    setCrop,
    setZoom,
    setRecommendedOrientation,
    onCropCompleteHandler,
    handleOrientationChange,
    handleAutoCenterCrop
  } = useCropState({ selectedOrientation, onOrientationChange });

  const { getCroppedImg, detectRecommendedOrientation } = useImageProcessing();

  // Auto-detect recommended orientation when image loads
  useEffect(() => {
    detectRecommendedOrientation(imageUrl, setRecommendedOrientation);
  }, [imageUrl]);

  const handleCropSave = async () => {
    if (croppedAreaPixels && imageUrl) {
      try {
        const croppedImage = await getCroppedImg(imageUrl, croppedAreaPixels);
        const currentOrientation = getCurrentOrientation().id;
        onCropComplete(croppedImage, cropAspect, currentOrientation);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleChangePhotoFile = (file: File) => {
    // Create object URL for the uploaded file and trigger the change photo callback
    const imageUrl = URL.createObjectURL(file);
    console.log('New photo selected in cropper:', imageUrl);
    
    // If there's a change photo callback, call it to handle the new image
    if (onChangePhoto) {
      // We need to pass the new image URL back to the parent component
      // For now, we'll just call the existing callback
      onChangePhoto();
      
      // In a real implementation, you might want to update the imageUrl prop
      // or have a more specific callback that accepts the new image URL
    }
  };

  const getCurrentOrientation = () => {
    return orientationOptions.find(opt => opt.ratio === cropAspect) || orientationOptions[0];
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 md:p-6">
      <div className="space-y-6">
        <CropperHeader />

        <OrientationSelector
          cropAspect={cropAspect}
          recommendedOrientation={recommendedOrientation}
          onOrientationChange={handleOrientationChange}
        />

        <CropArea
          imageUrl={imageUrl}
          crop={crop}
          zoom={zoom}
          cropAspect={cropAspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropCompleteHandler}
        />

        <CropperActions
          onChangePhoto={onChangePhoto ? handleChangePhotoFile : undefined}
          onAutoCenterCrop={handleAutoCenterCrop}
          onCropSave={handleCropSave}
          croppedAreaPixels={croppedAreaPixels}
        />
      </div>
    </div>
  );
};

export default PhotoCropper;
