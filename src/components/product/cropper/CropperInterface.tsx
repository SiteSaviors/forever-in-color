
import Cropper from 'react-easy-crop';

interface CropperInterfaceProps {
  imageUrl: string;
  crop: { x: number; y: number };
  zoom: number;
  cropAspect: number;
  onCropChange: (crop: { x: number; y: number }) => void;
  onZoomChange: (zoom: number) => void;
  onCropComplete: (croppedArea: any, croppedAreaPixels: any) => void;
}

const CropperInterface = ({
  imageUrl,
  crop,
  zoom,
  cropAspect,
  onCropChange,
  onZoomChange,
  onCropComplete
}: CropperInterfaceProps) => {
  return (
    <div className="relative w-full h-64 md:h-80 bg-black rounded-xl overflow-hidden shadow-inner">
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
  );
};

export default CropperInterface;
