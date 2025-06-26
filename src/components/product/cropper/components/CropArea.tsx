
import React from "react";
import Cropper from 'react-easy-crop';

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
        <Cropper 
          image={imageUrl}
          crop={crop}
          zoom={zoom}
          aspect={cropAspect}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropComplete}
        />
      </div>
    </div>
  );
};

export default CropArea;
