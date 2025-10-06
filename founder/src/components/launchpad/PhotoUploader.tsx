import { ChangeEvent, useRef, useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useFounderStore } from '@/store/useFounderStore';
import {
  readFileAsDataURL,
  detectOrientationFromDataUrl,
  generateCenteredCrop,
  cropImageToDataUrl,
} from '@/utils/imageUtils';
import CropperModal from '@/components/launchpad/cropper/CropperModal';
import { emitStepOneEvent } from '@/utils/telemetry';

const PhotoUploader = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const setUploadedImage = useFounderStore((state) => state.setUploadedImage);
  const setCroppedImage = useFounderStore((state) => state.setCroppedImage);
  const setOrientation = useFounderStore((state) => state.setOrientation);
  const generatePreviews = useFounderStore((state) => state.generatePreviews);
  const uploadedImage = useFounderStore((state) => state.uploadedImage);
  const croppedImage = useFounderStore((state) => state.croppedImage);
  const [isCropperOpen, setCropperOpen] = useState(false);
  const [cropSource, setCropSource] = useState<string | null>(null);

  const handleSelectFile = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const dataUrl = await readFileAsDataURL(file);
    setUploadedImage(dataUrl);
    const orientation = await detectOrientationFromDataUrl(dataUrl);
    setOrientation(orientation);
    emitStepOneEvent({ type: 'substep', value: 'crop' });

    const image = await loadImage(dataUrl);
    const crop = generateCenteredCrop(image.width, image.height, 1);
    const cropped = await cropImageToDataUrl(dataUrl, crop, 1024, 1024);
    setCroppedImage(cropped);
    setCropSource(dataUrl);
    setOrientation('square');
    await generatePreviews();
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
    setOrientation('square');
    await generatePreviews();
  };

  return (
    <Card glass className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <h3 className="text-xl font-semibold text-white">Upload & Smart Crop</h3>
      <p className="text-sm text-white/70">
        Drag a photo or browse your device. We detect orientation, suggest smart crops, and auto-advance the progress tracker.
      </p>
      <div className="rounded-2xl overflow-hidden border border-white/10 aspect-square flex items-center justify-center bg-white/5">
        {croppedImage ? (
          <img src={croppedImage} alt="Uploaded" className="w-full h-full object-cover" />
        ) : (
          <div className="text-white/40 text-sm">No image uploaded yet.</div>
        )}
      </div>
      <div className="flex gap-3">
        <Button className="flex-1" onClick={handleSelectFile}>
          Upload Photo
        </Button>
        <Button variant="ghost" className="flex-1" onClick={handleOpenCropper} disabled={!uploadedImage}>
          Adjust Crop
        </Button>
      </div>
      <p className="text-xs text-white/60">
        Supported: JPG, PNG up to 10MB. Manual crop option keeps your subject centered for the preview rail.
      </p>

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
