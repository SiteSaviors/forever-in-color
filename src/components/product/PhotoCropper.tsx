import { useState, useCallback } from "react";
import { Crop, RotateCcw, Monitor, Smartphone, Square, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Cropper from 'react-easy-crop';
interface PhotoCropperProps {
  imageUrl: string;
  initialAspectRatio?: number;
  selectedOrientation?: string;
  onCropComplete: (croppedImage: string, aspectRatio: number, orientation: string) => void;
  onOrientationChange?: (orientation: string) => void;
}
const PhotoCropper = ({
  imageUrl,
  initialAspectRatio = 1,
  selectedOrientation = "square",
  onCropComplete,
  onOrientationChange
}: PhotoCropperProps) => {
  const [crop, setCrop] = useState({
    x: 0,
    y: 0
  });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  // Auto-detect recommended orientation based on image dimensions
  const [recommendedOrientation, setRecommendedOrientation] = useState<string>("");

  // Convert selectedOrientation to aspect ratio
  const getAspectRatioFromOrientation = (orientation: string) => {
    switch (orientation) {
      case 'vertical':
        return 3 / 4;
      case 'horizontal':
        return 4 / 3;
      case 'square':
      default:
        return 1;
    }
  };
  const [cropAspect, setCropAspect] = useState(getAspectRatioFromOrientation(selectedOrientation));

  // Enhanced orientation options with better descriptions
  const orientationOptions = [{
    id: 'square',
    name: 'Square',
    ratio: 1,
    icon: Square,
    description: 'Perfect for social media & symmetric art',
    dimensions: '1:1'
  }, {
    id: 'horizontal',
    name: 'Horizontal',
    ratio: 4 / 3,
    icon: Monitor,
    description: 'Ideal for landscapes & wide shots',
    dimensions: '4:3'
  }, {
    id: 'vertical',
    name: 'Vertical',
    ratio: 3 / 4,
    icon: Smartphone,
    description: 'Best for portraits & tall compositions',
    dimensions: '3:4'
  }];

  // Auto-detect recommended orientation when image loads
  useState(() => {
    const img = new Image();
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      let detected = 'square';
      if (aspectRatio > 1.2) {
        detected = 'horizontal';
      } else if (aspectRatio < 0.8) {
        detected = 'vertical';
      } else {
        detected = 'square';
      }
      setRecommendedOrientation(detected);
      console.log('🎯 Auto-detected recommended orientation:', detected, 'from aspect ratio:', aspectRatio.toFixed(2));
    };
    img.src = imageUrl;
  });
  const onCropCompleteHandler = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);
  const createImage = (url: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', error => reject(error));
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
    ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
    return canvas.toDataURL('image/jpeg');
  };
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
  const handleAutoCenterCrop = () => {
    setCrop({
      x: 0,
      y: 0
    });
    setZoom(1);
  };
  const handleOrientationChange = (newAspect: number, orientationId: string) => {
    console.log('PhotoCropper: Orientation changed to:', orientationId, 'with aspect ratio:', newAspect);
    setCropAspect(newAspect);
    // Reset crop position when aspect ratio changes
    setCrop({
      x: 0,
      y: 0
    });
    setZoom(1);

    // Notify parent component about orientation change
    if (onOrientationChange) {
      console.log('PhotoCropper: Notifying parent of orientation change:', orientationId);
      onOrientationChange(orientationId);
    }
  };
  const getCurrentOrientation = () => {
    return orientationOptions.find(opt => opt.ratio === cropAspect) || orientationOptions[0];
  };
  return <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 md:p-6">
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="text-center space-y-3">
          
          <h3 className="text-xl font-bold text-gray-900">Choose Canvas Orientation</h3>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">Select your preferred canvas orientation and adjust the crop to highlight the best part of your photo. Your choice here will be used throughout the process.</p>
        </div>

        {/* Prominent Orientation Selection */}
        <div className="space-y-4">
          <div className="text-center">
            
            {recommendedOrientation}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {orientationOptions.map(option => {
            const IconComponent = option.icon;
            const isActive = cropAspect === option.ratio;
            const isRecommended = option.id === recommendedOrientation;
            return <div key={option.id} className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${isActive ? 'border-purple-500 bg-purple-50 shadow-lg transform scale-105' : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-25'}`} onClick={() => handleOrientationChange(option.ratio, option.id)}>
                  {isRecommended}
                  
                  <div className="text-center space-y-3">
                    <div className={`flex justify-center p-3 rounded-lg ${isActive ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                      <IconComponent className="w-8 h-8" />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <h5 className="font-bold text-lg text-gray-900">{option.name}</h5>
                        <Badge variant="outline" className="text-xs">{option.dimensions}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {option.description}
                      </p>
                    </div>
                    
                    {isActive && <Badge className="bg-purple-500 text-white">
                        ✓ Selected
                      </Badge>}
                  </div>
                </div>;
          })}
          </div>
        </div>

        {/* Crop Area */}
        <div className="space-y-3">
          <div className="text-center">
            <h4 className="text-lg font-semibold text-gray-800">Perfect Your Crop</h4>
            <p className="text-sm text-gray-600">
              Adjust the crop area to highlight the best part of your photo
            </p>
          </div>
          
          <div className="relative w-full h-80 bg-black rounded-xl overflow-hidden shadow-inner">
            <Cropper image={imageUrl} crop={crop} zoom={zoom} aspect={cropAspect} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropCompleteHandler} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row justify-center gap-3 md:gap-4">
          <Button variant="outline" onClick={handleAutoCenterCrop} className="text-sm flex items-center gap-2 border-purple-200 hover:bg-purple-50">
            <RotateCcw className="w-4 h-4" />
            Reset Crop Position
          </Button>
          <Button onClick={handleCropSave} disabled={!croppedAreaPixels} className="bg-purple-600 hover:bg-purple-700 text-sm font-medium px-8 py-3">
            <Crop className="w-4 h-4 mr-2" />
            Apply Canvas & Crop
          </Button>
        </div>
      </div>
    </div>;
};
export default PhotoCropper;