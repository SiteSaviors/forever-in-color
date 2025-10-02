
import { lazy, Suspense } from 'react';

// Lazy load the heavy react-easy-crop library
const Cropper = lazy(() => import('react-easy-crop'));

interface CropAreaProps {
  imageUrl: string;
  crop: { x: number; y: number };
  zoom: number;
  cropAspect: number;
  onCropChange: (crop: { x: number; y: number }) => void;
  onZoomChange: (zoom: number) => void;
  onCropComplete: (croppedArea: any, croppedAreaPixels: any) => void;
}

const CropArea = ({
  imageUrl,
  crop,
  zoom,
  cropAspect,
  onCropChange,
  onZoomChange,
  onCropComplete
}: CropAreaProps) => {
  return (
    <div className="space-y-3">
      <div className="text-center">
        <h4 className="text-lg font-semibold text-gray-800">Perfect Your Crop</h4>
        <p className="text-sm text-gray-600">
          Adjust the crop area to highlight the best part of your photo
        </p>
      </div>

      <div className="relative w-full h-80 bg-black rounded-xl overflow-hidden shadow-inner">
        <Suspense fallback={
          <div className="flex items-center justify-center h-full">
            <div className="text-white text-sm">Loading cropper...</div>
          </div>
        }>
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={cropAspect}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropComplete}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default CropArea;
