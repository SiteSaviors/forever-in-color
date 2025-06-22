
import { useState, useCallback } from "react";
import { Crop } from "lucide-react";
import { Button } from "@/components/ui/button";
import Cropper from 'react-easy-crop';

interface PhotoCropperProps {
  imageUrl: string;
  onCropComplete: (croppedImage: string) => void;
  onSkip: () => void;
}

const PhotoCropper = ({ imageUrl, onCropComplete, onSkip }: PhotoCropperProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [cropAspect, setCropAspect] = useState(1); // 1 = square, 4/3 = horizontal, 3/4 = vertical

  const onCropCompleteHandler = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return canvas.toDataURL('image/jpeg');
  };

  const handleCropSave = async () => {
    if (croppedAreaPixels && imageUrl) {
      try {
        const croppedImage = await getCroppedImg(imageUrl, croppedAreaPixels);
        onCropComplete(croppedImage);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleAutoCenterCrop = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
      <div className="space-y-6">
        <div className="text-center">
          <h4 className="text-xl font-semibold text-gray-900 mb-2 flex items-center justify-center gap-2">
            <Crop className="w-5 h-5 text-purple-600" />
            Perfect Your Photo
          </h4>
          <p className="text-gray-600">
            Adjust the crop to highlight the best part of your image
          </p>
        </div>

        {/* Crop Area */}
        <div className="relative w-full h-80 bg-black rounded-xl overflow-hidden">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={cropAspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropCompleteHandler}
          />
        </div>

        {/* Aspect Ratio Controls */}
        <div className="flex justify-center gap-2">
          <Button
            variant={cropAspect === 1 ? "default" : "outline"}
            size="sm"
            onClick={() => setCropAspect(1)}
            className="text-xs"
          >
            Square
          </Button>
          <Button
            variant={cropAspect === 4/3 ? "default" : "outline"}
            size="sm"
            onClick={() => setCropAspect(4/3)}
            className="text-xs"
          >
            Horizontal
          </Button>
          <Button
            variant={cropAspect === 3/4 ? "default" : "outline"}
            size="sm"
            onClick={() => setCropAspect(3/4)}
            className="text-xs"
          >
            Vertical
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={handleAutoCenterCrop}
            className="text-sm"
          >
            Auto-Center
          </Button>
          <Button
            variant="ghost"
            onClick={onSkip}
            className="text-sm text-gray-500"
          >
            Skip, I'm Good
          </Button>
          <Button
            onClick={handleCropSave}
            className="bg-purple-600 hover:bg-purple-700 text-sm"
          >
            Apply Crop
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PhotoCropper;
