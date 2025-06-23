import { useState, useCallback } from "react";
import { Crop, RotateCcw, Monitor, Smartphone, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Cropper from 'react-easy-crop';

interface PhotoCropperProps {
  imageUrl: string;
  initialAspectRatio?: number;
  onCropComplete: (croppedImage: string, aspectRatio: number) => void;
  onSkip: () => void;
  onOrientationChange?: (aspectRatio: number) => void;
}

const PhotoCropper = ({ 
  imageUrl, 
  initialAspectRatio = 1,
  onCropComplete, 
  onSkip,
  onOrientationChange 
}: PhotoCropperProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [cropAspect, setCropAspect] = useState(initialAspectRatio);

  const orientationOptions = [
    { 
      id: 'square', 
      name: 'Square', 
      ratio: 1, 
      icon: Square,
      description: 'Perfect for social media'
    },
    { 
      id: 'horizontal', 
      name: 'Horizontal', 
      ratio: 4/3, 
      icon: Monitor,
      description: 'Great for landscapes'
    },
    { 
      id: 'vertical', 
      name: 'Vertical', 
      ratio: 3/4, 
      icon: Smartphone,
      description: 'Ideal for portraits'
    }
  ];

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
        onCropComplete(croppedImage, cropAspect);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleAutoCenterCrop = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleOrientationChange = (newAspect: number) => {
    setCropAspect(newAspect);
    // Reset crop position when aspect ratio changes
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    
    // Notify parent component about orientation change
    if (onOrientationChange) {
      onOrientationChange(newAspect);
    }
  };

  const getCurrentOrientation = () => {
    return orientationOptions.find(opt => opt.ratio === cropAspect) || orientationOptions[0];
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 md:p-6">
      <div className="space-y-4 md:space-y-6">
        {/* Orientation Selection - Enhanced for better UX */}
        <div className="space-y-3">
          <div className="text-center">
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 font-medium">
              Current: {getCurrentOrientation().name}
            </Badge>
          </div>
          
          <div className="grid grid-cols-3 gap-2 md:gap-3 max-w-md mx-auto">
            {orientationOptions.map((option) => {
              const IconComponent = option.icon;
              const isActive = cropAspect === option.ratio;
              
              return (
                <Button
                  key={option.id}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleOrientationChange(option.ratio)}
                  className={`flex flex-col items-center gap-1 h-auto py-2 px-2 md:px-3 text-xs ${
                    isActive 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                      : 'hover:bg-purple-50 hover:border-purple-300'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="font-medium">{option.name}</span>
                  <span className="text-[10px] opacity-75 hidden md:block">
                    {option.description}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Crop Area */}
        <div className="relative w-full h-64 md:h-80 bg-black rounded-xl overflow-hidden">
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

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row justify-center gap-3 md:gap-4">
          <Button
            variant="outline"
            onClick={handleAutoCenterCrop}
            className="text-sm flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
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
