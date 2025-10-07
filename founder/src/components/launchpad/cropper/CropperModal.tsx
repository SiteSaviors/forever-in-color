import * as Dialog from '@radix-ui/react-dialog';
import Cropper, { Area } from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { useCallback, useState } from 'react';
import Button from '@/components/ui/Button';
import { cropImageToDataUrl } from '@/utils/imageUtils';

interface CropperModalProps {
  open: boolean;
  image: string | null;
  onClose: () => void;
  onComplete: (dataUrl: string) => Promise<void> | void;
  aspectRatio?: number;
}

const CropperModal = ({ open, image, onClose, onComplete, aspectRatio = 1 }: CropperModalProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixelsValue: Area) => {
    setCroppedAreaPixels(croppedAreaPixelsValue);
  }, []);

  const handleSave = async () => {
    if (!image || !croppedAreaPixels) return;
    setSubmitting(true);
    try {
      const baseSize = 1024;
      const outputWidth = aspectRatio >= 1 ? baseSize : Math.round(baseSize * aspectRatio);
      const outputHeight = aspectRatio >= 1 ? Math.round(baseSize / aspectRatio) : baseSize;

      const cropped = await cropImageToDataUrl(image, {
        x: croppedAreaPixels.x,
        y: croppedAreaPixels.y,
        width: croppedAreaPixels.width,
        height: croppedAreaPixels.height,
      }, outputWidth, outputHeight);
      await onComplete(cropped);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(value) => !value && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-950/70 backdrop-blur" />
        <Dialog.Content className="fixed inset-0 flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-white/10 rounded-[2rem] shadow-founder w-full max-w-3xl p-6 space-y-4">
            <Dialog.Title className="text-xl font-semibold text-white">Adjust Crop</Dialog.Title>
            <Dialog.Description className="text-sm text-white/60">
              Drag to reposition or zoom. We maintain the current canvas ratio so your preview matches the final art.
            </Dialog.Description>
            <div className="relative h-[60vh] bg-black/40 rounded-2xl overflow-hidden">
              {image && (
                <Cropper
                  image={image}
                  crop={crop}
                  zoom={zoom}
                  aspect={aspectRatio}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              )}
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <Button variant="ghost" className="flex-1" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSave} disabled={submitting}>
                {submitting ? 'Saving…' : 'Save Crop'}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CropperModal;
