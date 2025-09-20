
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
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
    <div className="relative">
      {/* Premium Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 opacity-60" />
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 25% 25%, rgba(120, 119, 198, 0.08) 0%, transparent 50%), 
                         radial-gradient(circle at 75% 75%, rgba(255, 119, 198, 0.08) 0%, transparent 50%)`
      }} />
      
      <div className="relative p-4 md:p-8">
        <Card className="overflow-hidden border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <div className="p-6 md:p-8 space-y-8">
            <CropperHeader />

            <OrientationSelector
              cropAspect={cropAspect}
              recommendedOrientation={recommendedOrientation}
              onOrientationChange={handleOrientationChange}
            />

            <div className="relative">
              {/* Crop area with premium styling */}
              <div className="rounded-2xl overflow-hidden shadow-2xl bg-white p-2">
                <CropArea
                  imageUrl={imageUrl}
                  crop={crop}
                  zoom={zoom}
                  cropAspect={cropAspect}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropCompleteHandler}
                />
              </div>
              
              {/* Premium glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400/10 to-pink-400/10 blur-xl -z-10" />
            </div>

            <CropperActions
              onChangePhoto={onChangePhoto ? handleChangePhotoFile : undefined}
              onAutoCenterCrop={handleAutoCenterCrop}
              onCropSave={handleCropSave}
              croppedAreaPixels={croppedAreaPixels}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PhotoCropper;
