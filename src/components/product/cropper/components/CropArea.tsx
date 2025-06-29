
import { memo } from "react";
import Cropper from "react-easy-crop";

interface CropAreaProps {
  imageUrl: string;
  crop: { x: number; y: number };
  zoom: number;
  aspectRatio: number;
  onCropChange: (crop: { x: number; y: number }) => void;
  onZoomChange: (zoom: number) => void;
  onCropComplete: (croppedArea: any, croppedAreaPixels: any) => void;
}

const CropArea = memo(({
  imageUrl,
  crop,
  zoom,
  aspectRatio,
  onCropChange,
  onZoomChange,
  onCropComplete
}: CropAreaProps) => {
  return (
    <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
      <Cropper
        image={imageUrl}
        crop={crop}
        zoom={zoom}
        aspect={aspectRatio}
        onCropChange={onCropChange}
        onCropComplete={onCropComplete}
        onZoomChange={onZoomChange}
      />
    </div>
  );
});

CropArea.displayName = 'CropArea';

export default CropArea;
