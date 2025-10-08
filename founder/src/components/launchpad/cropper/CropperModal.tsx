import * as Dialog from '@radix-ui/react-dialog';
import Cropper, { Area } from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Button from '@/components/ui/Button';
import { cropImageToDataUrl } from '@/utils/imageUtils';
import type { Orientation } from '@/utils/imageUtils';
import {
  ORIENTATION_PRESETS,
  SmartCropResult,
  cacheSmartCropResult,
  generateSmartCrop,
  getCachedSmartCropResult,
} from '@/utils/smartCrop';

interface CropperModalProps {
  open: boolean;
  originalImage: string | null;
  originalDimensions: { width: number; height: number } | null;
  initialOrientation: Orientation;
  smartCropCache?: Partial<Record<Orientation, SmartCropResult>>;
  onClose: () => void;
  onComplete: (result: SmartCropResult) => Promise<void> | void;
  onSmartCropReady?: (result: SmartCropResult) => void;
}

const DEFAULT_ZOOM = 1;

const CropperModal = ({
  open,
  originalImage,
  originalDimensions,
  initialOrientation,
  smartCropCache = {},
  onClose,
  onComplete,
  onSmartCropReady,
}: CropperModalProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeOrientation, setActiveOrientation] = useState<Orientation>(initialOrientation);
  const [initialArea, setInitialArea] = useState<CropRegionOrNull>(null);
  const [loadingOrientation, setLoadingOrientation] = useState(false);

  const orientationPreset = useMemo(
    () => ORIENTATION_PRESETS[activeOrientation],
    [activeOrientation]
  );

  useEffect(() => {
    if (!open) return;
    setActiveOrientation(initialOrientation);
  }, [open, initialOrientation]);

  useEffect(() => {
    if (!open) return;
    setCrop({ x: 0, y: 0 });
    setZoom(DEFAULT_ZOOM);
  }, [open, activeOrientation]);

  useEffect(() => {
    if (!open) return;
    if (initialArea) {
      setCroppedAreaPixels(initialArea);
    } else {
      setCroppedAreaPixels(null);
    }
  }, [initialArea, open]);

  const ensureSmartCrop = useCallback(
    async (orientation: Orientation) => {
      if (!originalImage) return null;

      const cached = smartCropCache[orientation] ?? getCachedSmartCropResult(originalImage, orientation);
      if (cached && cached.region.width > 0 && cached.region.height > 0) {
        return cached;
      }

      const result = await generateSmartCrop(originalImage, orientation);
      cacheSmartCropResult(originalImage, orientation, result);
      onSmartCropReady?.(result);
      return result;
    },
    [originalImage, smartCropCache, onSmartCropReady]
  );

  useEffect(() => {
    if (!open) return;
    let isMounted = true;

    const hydrate = async () => {
      if (!originalImage) {
        setInitialArea(null);
        setLoadingOrientation(false);
        return;
      }

      const existing = smartCropCache[activeOrientation];
      if (existing && existing.region.width > 0 && existing.region.height > 0) {
        if (isMounted) {
          setInitialArea(existing.region);
          setLoadingOrientation(false);
        }
        return;
      }

      setLoadingOrientation(true);
      const result = await ensureSmartCrop(activeOrientation);
      if (isMounted) {
        setInitialArea(result?.region ?? null);
        setLoadingOrientation(false);
      }
    };

    void hydrate();

    return () => {
      isMounted = false;
    };
  }, [open, activeOrientation, smartCropCache, ensureSmartCrop, originalImage]);

  const onCropComplete = useCallback((_croppedArea: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleOrientationSelect = (orientation: Orientation) => {
    if (orientation === activeOrientation) return;
    setLoadingOrientation(true);
    setActiveOrientation(orientation);
    const existing = smartCropCache[orientation];
    if (existing && existing.region.width > 0 && existing.region.height > 0) {
      setInitialArea(existing.region);
      setLoadingOrientation(false);
    } else {
      setInitialArea(null);
    }
  };

  const handleSave = async () => {
    if (!originalImage || !croppedAreaPixels) return;
    setSubmitting(true);
    try {
      const outputWidth = orientationPreset.ratio >= 1 ? 1024 : Math.round(1024 * orientationPreset.ratio);
      const outputHeight = orientationPreset.ratio >= 1 ? Math.round(1024 / orientationPreset.ratio) : 1024;

      const dataUrl = await cropImageToDataUrl(
        originalImage,
        {
          x: croppedAreaPixels.x,
          y: croppedAreaPixels.y,
          width: croppedAreaPixels.width,
          height: croppedAreaPixels.height,
        },
        outputWidth,
        outputHeight
      );

      const result: SmartCropResult = {
        orientation: activeOrientation,
        dataUrl,
        region: {
          x: croppedAreaPixels.x,
          y: croppedAreaPixels.y,
          width: croppedAreaPixels.width,
          height: croppedAreaPixels.height,
        },
        imageDimensions: originalDimensions ?? { width: 0, height: 0 },
        generatedAt: Date.now(),
        generatedBy: 'manual',
      };

      cacheSmartCropResult(originalImage, activeOrientation, result);
      onSmartCropReady?.(result);
      await onComplete(result);
    } finally {
      setSubmitting(false);
    }
  };

  const orientationOptions: Orientation[] = ['vertical', 'square', 'horizontal'];

  return (
    <Dialog.Root open={open} onOpenChange={(value) => !value && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-950/70 backdrop-blur" />
        <Dialog.Content className="fixed inset-0 flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-white/10 rounded-[2rem] shadow-founder w-full max-w-4xl p-6 space-y-5">
            <Dialog.Title className="text-xl font-semibold text-white">Adjust Crop</Dialog.Title>
            <Dialog.Description className="text-sm text-white/60">
              Refine the framing or explore different orientations. We keep the canvas ratio synced so
              your preview always matches the final art.
            </Dialog.Description>

            <div className="flex flex-wrap gap-2">
              {orientationOptions.map((option) => {
                const preset = ORIENTATION_PRESETS[option];
                const isActive = option === activeOrientation;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleOrientationSelect(option)}
                    disabled={loadingOrientation || submitting}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-glow-soft'
                        : 'bg-white/10 text-white/70 border border-white/15 hover:bg-white/15'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            <div className="relative h-[60vh] bg-black/40 rounded-2xl overflow-hidden border border-white/5">
              {originalImage ? (
                <Cropper
                  key={activeOrientation}
                  image={originalImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={orientationPreset.ratio}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  initialCroppedAreaPixels={initialArea ?? undefined}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-white/60 text-sm">
                  No image available for cropping.
                </div>
              )}

              {loadingOrientation && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                  <div className="w-10 h-10 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                  <p className="text-white text-sm font-medium">Preparing smart crop…</p>
                </div>
              )}

              <div className="absolute top-4 left-4 rounded-full bg-purple-500/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-md backdrop-blur">
                {orientationPreset.label}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={onClose}
                disabled={submitting || loadingOrientation}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSave}
                disabled={submitting || loadingOrientation || !originalImage}
              >
                {submitting ? 'Saving…' : 'Save Crop'}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

type CropRegionOrNull = {
  x: number;
  y: number;
  width: number;
  height: number;
} | null;

export default CropperModal;
