
import { useState, useCallback } from "react";
import { getAspectRatioFromOrientation } from "../data/orientationOptions";

interface UseCropStateProps {
  selectedOrientation: string;
  onOrientationChange?: (orientation: string) => void;
}

export const useCropState = ({ selectedOrientation, onOrientationChange }: UseCropStateProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [cropAspect, setCropAspect] = useState(getAspectRatioFromOrientation(selectedOrientation));
  const [recommendedOrientation, setRecommendedOrientation] = useState<string>("");

  const onCropCompleteHandler = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleOrientationChange = (newAspect: number, orientationId: string) => {
    console.log('PhotoCropper: Orientation changed to:', orientationId, 'with aspect ratio:', newAspect);
    setCropAspect(newAspect);
    setCrop({ x: 0, y: 0 });
    setZoom(1);

    if (onOrientationChange) {
      console.log('PhotoCropper: Notifying parent of orientation change:', orientationId);
      onOrientationChange(orientationId);
    }
  };

  const handleAutoCenterCrop = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  return {
    crop,
    zoom,
    cropAspect,
    croppedAreaPixels,
    recommendedOrientation,
    setCrop,
    setZoom,
    setCropAspect,
    setRecommendedOrientation,
    onCropCompleteHandler,
    handleOrientationChange,
    handleAutoCenterCrop
  };
};
