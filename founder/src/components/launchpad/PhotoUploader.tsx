import { ChangeEvent, DragEvent, useMemo, useRef, useState } from 'react';
import { clsx } from 'clsx';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useFounderStore } from '@/store/useFounderStore';
import {
  readFileAsDataURL,
  detectOrientationFromDataUrl,
  generateCenteredCrop,
  cropImageToDataUrl,
} from '@/utils/imageUtils';
import CropperModal from '@/components/launchpad/cropper/CropperModal';
import { emitStepOneEvent } from '@/utils/telemetry';

const SAMPLE_IMAGE = 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80';

const orientationCopy: Record<string, string> = {
  horizontal: 'Landscape — perfect for panoramas and family groups.',
  vertical: 'Portrait — great for single subjects or close-ups.',
  square: 'Square — versatile fit for most canvases.',
};

const PhotoUploader = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const setUploadedImage = useFounderStore((state) => state.setUploadedImage);
  const setCroppedImage = useFounderStore((state) => state.setCroppedImage);
  const setOrientation = useFounderStore((state) => state.setOrientation);
  const setOrientationTip = useFounderStore((state) => state.setOrientationTip);
  const markCropReady = useFounderStore((state) => state.markCropReady);
  const setDragging = useFounderStore((state) => state.setDragging);
  const generatePreviews = useFounderStore((state) => state.generatePreviews);
  const uploadedImage = useFounderStore((state) => state.uploadedImage);
  const croppedImage = useFounderStore((state) => state.croppedImage);
  const orientation = useFounderStore((state) => state.orientation);
  const orientationTip = useFounderStore((state) => state.orientationTip);
  const cropReadyAt = useFounderStore((state) => state.cropReadyAt);
  const isDragging = useFounderStore((state) => state.isDragging);
  const [isCropperOpen, setCropperOpen] = useState(false);
  const [cropSource, setCropSource] = useState<string | null>(null);

  const cropReadyLabel = useMemo(() => {
    if (!cropReadyAt) return null;
    const delta = Date.now() - cropReadyAt;
    if (delta < 1000 * 5) return 'Just now';
    if (delta < 1000 * 60) return `${Math.floor(delta / 1000)}s ago`;
    return 'Updated';
  }, [cropReadyAt]);

  const orientationMessage = useMemo(() => {
    if (!uploadedImage) return null;
    return orientationTip ?? orientationCopy[orientation];
  }, [orientationTip, orientation, uploadedImage]);

  const handleSelectFile = () => {
    inputRef.current?.click();
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    emitStepOneEvent({ type: 'upload_started' });
    const dataUrl = await readFileAsDataURL(file);
    await processDataUrl(dataUrl);
  };

  const processDataUrl = async (dataUrl: string) => {
    setUploadedImage(dataUrl);
    const detectedOrientation = await detectOrientationFromDataUrl(dataUrl);
    setOrientation(detectedOrientation);
    setOrientationTip(orientationCopy[detectedOrientation]);
    emitStepOneEvent({ type: 'upload_success', value: detectedOrientation });

    const image = await loadImage(dataUrl);
    const crop = generateCenteredCrop(image.width, image.height, 1);
    const cropped = await cropImageToDataUrl(dataUrl, crop, 1024, 1024);
    setCroppedImage(cropped);
    setCropSource(dataUrl);
    markCropReady();
    await generatePreviews();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    emitStepOneEvent({ type: 'upload_started' });
    setDragging(false);
    const dataUrl = await readFileAsDataURL(file);
    await processDataUrl(dataUrl);
  };

  const handleSamplePhoto = async () => {
    emitStepOneEvent({ type: 'upload_started' });
    setDragging(false);
    const response = await fetch(SAMPLE_IMAGE);
    const blob = await response.blob();
    const reader = new FileReader();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
    await processDataUrl(dataUrl);
  };

  const handleOpenCropper = () => {
    if (!uploadedImage) return;
    setCropSource(uploadedImage);
    setCropperOpen(true);
  };

  const handleCropComplete = async (dataUrl: string) => {
    setCroppedImage(dataUrl);
    setCropperOpen(false);
    emitStepOneEvent({ type: 'substep', value: 'crop' });
    markCropReady();
    await generatePreviews();
  };

  return (
    <Card glass className="space-y-4 relative overflow-hidden">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <div
        className={clsx('dropzone-base', isDragging && 'dropzone-active')}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="absolute inset-0 bg-dropzone-radial opacity-60 pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <h3 className="text-xl font-semibold text-white">Upload & Smart Crop</h3>
          <p className="text-sm text-white/70">
            Drag a photo onto this canvas or use the buttons below. We’ll detect orientation, suggest a smart crop, and start generating previews immediately.
          </p>
          <div className="rounded-2xl overflow-hidden border border-white/10 aspect-square flex items-center justify-center bg-white/5">
            {croppedImage ? (
              <img src={croppedImage} alt="Uploaded" className="w-full h-full object-cover" />
            ) : (
              <div className="text-white/50 text-sm">
                {isDragging ? 'Drop to upload' : 'Drop image here or use the buttons below'}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button className="flex-1" onClick={handleSelectFile}>
              Upload Photo
            </Button>
            <Button variant="ghost" className="flex-1" onClick={handleOpenCropper} disabled={!uploadedImage}>
              Adjust Crop
            </Button>
            <Button variant="ghost" className="flex-1" onClick={handleSamplePhoto}>
              Try Sample Photo
            </Button>
          </div>
          <p className="text-xs text-white/60">
            Supported: JPG, PNG up to 10MB. Drag-and-drop is fully supported, and you can fine-tune the crop anytime.
          </p>
        </div>
      </div>

      {orientationMessage && (
        <div className="flex items-center gap-2 text-sm text-white/80">
          <Badge variant="emerald">Orientation</Badge>
          <span>{orientationMessage}</span>
        </div>
      )}

      {croppedImage && (
        <div className="flex items-center gap-2 text-xs text-white/60">
          <Badge variant="brand">Smart Crop Ready</Badge>
          <span>{cropReadyLabel}</span>
        </div>
      )}

      <CropperModal
        open={isCropperOpen}
        image={cropSource}
        onClose={() => setCropperOpen(false)}
        onComplete={handleCropComplete}
      />
    </Card>
  );
};

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export default PhotoUploader;
