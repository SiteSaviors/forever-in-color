
import { useState, useCallback } from "react";

interface CropState {
  crop: { x: number; y: number };
  zoom: number;
  aspectRatio: number;
  croppedAreaPixels: any | null;
}

export const useCropState = (initialAspectRatio: number = 1) => {
  const [cropState, setCropState] = useState<CropState>({
    crop: { x: 0, y: 0 },
    zoom: 1,
    aspectRatio: initialAspectRatio,
    croppedAreaPixels: null,
  });

  const setCrop = useCallback((crop: { x: number; y: number }) => {
    setCropState(prev => ({ ...prev, crop }));
  }, []);

  const setZoom = useCallback((zoom: number) => {
    setCropState(prev => ({ ...prev, zoom }));
  }, []);

  const setAspectRatio = useCallback((aspectRatio: number) => {
    setCropState(prev => ({ ...prev, aspectRatio }));
  }, []);

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCropState(prev => ({ ...prev, croppedAreaPixels }));
  }, []);

  return {
    cropState,
    setCrop,
    setZoom,
    setAspectRatio,
    onCropComplete,
  };
};
