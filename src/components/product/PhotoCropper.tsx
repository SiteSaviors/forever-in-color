import { useState, useEffect, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { getCroppedImg } from "@/utils/photoOperations";
import { detectRecommendedOrientation } from "@/utils/smartCropUtils";
import { Card, CardContent } from "@/components/ui/card";

interface PhotoCropperProps {
  imageUrl: string;
  onCropComplete: (croppedImageUrl: string, cropAspectRatio: number) => void;
  onCancel: () => void;
  recommendedOrientation?: string;
  setRecommendedOrientation?: (orientation: string) => void;
}

const PhotoCropper = ({ 
  imageUrl, 
  onCropComplete, 
  onCancel,
  setRecommendedOrientation 
}: PhotoCropperProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [aspectRatio, setAspectRatio] = useState(1);

  const onCropChange = (crop: any) => {
    setCrop(crop);
  };

  const onCropCompleteCallback = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Detect recommended orientation based on image analysis
  useEffect(() => {
    const analyzeImage = async () => {
      try {
        const recommendedOrientation = await detectRecommendedOrientation(imageUrl);
        if (setRecommendedOrientation) {
          setRecommendedOrientation(recommendedOrientation);
        }
      } catch (error) {
        console.error('Error detecting orientation:', error);
      }
    };

    if (imageUrl) {
      analyzeImage();
    }
  }, [imageUrl, setRecommendedOrientation]);

  const handleCropSubmit = useCallback(async () => {
    if (!croppedAreaPixels) return;

    try {
      const croppedImage = await getCroppedImg(imageUrl, croppedAreaPixels);
      onCropComplete(croppedImage, aspectRatio);
    } catch (e) {
      console.error(e);
    }
  }, [croppedAreaPixels, imageUrl, onCropComplete, aspectRatio]);

  const orientationOptions = [
    { label: "Square", value: 1, key: "square" },
    { label: "Horizontal", value: 4/3, key: "horizontal" },
    { label: "Vertical", value: 3/4, key: "vertical" },
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={aspectRatio}
              onCropChange={onCropChange}
              onCropComplete={onCropCompleteCallback}
              onZoomChange={setZoom}
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Zoom</label>
              <Slider
                value={[zoom]}
                onValueChange={(values) => setZoom(values[0])}
                min={1}
                max={3}
                step={0.1}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Orientation</label>
              <div className="flex gap-2">
                {orientationOptions.map((option) => (
                  <Button
                    key={option.key}
                    variant={aspectRatio === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAspectRatio(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleCropSubmit}>
              Apply Crop
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PhotoCropper;
