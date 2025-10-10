import { ChangeEvent, DragEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { clsx } from 'clsx';
import Card from '@/components/ui/Card';
import { useFounderStore } from '@/store/useFounderStore';
import { readFileAsDataURL, getImageDimensions, determineOrientationFromDimensions } from '@/utils/imageUtils';
import CropperModal from '@/components/launchpad/cropper/CropperModal';
import SmartCropPreview from '@/components/launchpad/SmartCropPreview';
import AIAnalysisOverlay from '@/components/launchpad/AIAnalysisOverlay';
import { emitStepOneEvent } from '@/utils/telemetry';
import { ORIENTATION_PRESETS, cacheSmartCropResult, clearSmartCropCacheForImage, SmartCropResult } from '@/utils/smartCrop';
import type { Orientation } from '@/utils/imageUtils';

const SAMPLE_IMAGE = 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80';

type UploadStage = 'idle' | 'analyzing' | 'preview' | 'cropper' | 'complete';

const PhotoUploader = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const setUploadedImage = useFounderStore((state) => state.setUploadedImage);
  const setCroppedImage = useFounderStore((state) => state.setCroppedImage);
  const setOriginalImage = useFounderStore((state) => state.setOriginalImage);
  const setOriginalImageDimensions = useFounderStore((state) => state.setOriginalImageDimensions);
  const originalImage = useFounderStore((state) => state.originalImage);
  const originalImageDimensions = useFounderStore((state) => state.originalImageDimensions);
  const smartCrops = useFounderStore((state) => state.smartCrops);
  const setOrientation = useFounderStore((state) => state.setOrientation);
  const setOrientationTip = useFounderStore((state) => state.setOrientationTip);
  const markCropReady = useFounderStore((state) => state.markCropReady);
  const setDragging = useFounderStore((state) => state.setDragging);
  const generatePreviews = useFounderStore((state) => state.generatePreviews);
  const resetPreviews = useFounderStore((state) => state.resetPreviews);
  const shouldAutoGeneratePreviews = useFounderStore((state) => state.shouldAutoGeneratePreviews);
  const setSmartCropForOrientation = useFounderStore((state) => state.setSmartCropForOrientation);
  const clearSmartCrops = useFounderStore((state) => state.clearSmartCrops);
  const setPreviewState = useFounderStore((state) => state.setPreviewState);
  const croppedImage = useFounderStore((state) => state.croppedImage);
  const orientation = useFounderStore((state) => state.orientation);
  const orientationTip = useFounderStore((state) => state.orientationTip);
  const cropReadyAt = useFounderStore((state) => state.cropReadyAt);
  const isDragging = useFounderStore((state) => state.isDragging);
  const uploadIntentAt = useFounderStore((state) => state.uploadIntentAt);
  const [isCropperOpen, setCropperOpen] = useState(false);
  const [stage, setStage] = useState<UploadStage>('idle');
  const [pendingOrientation, setPendingOrientation] = useState<Orientation>('square');
  const lastHandledUploadIntentRef = useRef<number | null>(null);
  const previousOriginalRef = useRef<string | null>(null);

  const cropReadyLabel = useMemo(() => {
    if (!cropReadyAt) return null;
    const delta = Date.now() - cropReadyAt;
    if (delta < 1000 * 5) return 'Just now';
    if (delta < 1000 * 60) return `${Math.floor(delta / 1000)}s ago`;
    return 'Updated';
  }, [cropReadyAt]);

  const orientationMeta = useMemo(() => ORIENTATION_PRESETS[orientation], [orientation]);

  const orientationMessage = useMemo(() => {
    if (!croppedImage) return null;
    return orientationTip ?? orientationMeta.description;
  }, [croppedImage, orientationMeta.description, orientationTip]);

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
    setStage('analyzing');
    if (previousOriginalRef.current) {
      clearSmartCropCacheForImage(previousOriginalRef.current);
    }
    clearSmartCropCacheForImage(dataUrl);
    setOriginalImage(dataUrl);
    setOriginalImageDimensions(null);
    setUploadedImage(null);
    setCroppedImage(null);
    clearSmartCrops();
    resetPreviews();

    const { width, height } = await getImageDimensions(dataUrl);
    setOriginalImageDimensions({ width, height });
    const detectedOrientation = determineOrientationFromDimensions(width, height);
    setOrientation(detectedOrientation);
    setPendingOrientation(detectedOrientation);
    setOrientationTip(ORIENTATION_PRESETS[detectedOrientation].description);
    emitStepOneEvent({ type: 'upload_success', value: detectedOrientation });

    // Note: AIAnalysisOverlay will call setStage('preview') when animation completes
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

  useEffect(() => {
    if (!uploadIntentAt) return;
    if (lastHandledUploadIntentRef.current === uploadIntentAt) return;
    lastHandledUploadIntentRef.current = uploadIntentAt;
    handleSelectFile();
  }, [uploadIntentAt]);

  const finalizeCrop = async (result: SmartCropResult, source: 'auto' | 'manual') => {
    const targetOrientation = result.orientation;
    const orientationChanged = targetOrientation !== orientation;

    setSmartCropForOrientation(targetOrientation, result);
    if (originalImage) {
      cacheSmartCropResult(originalImage, targetOrientation, result);
    }
    setCroppedImage(result.dataUrl);
    setUploadedImage(result.dataUrl);

    if (orientationChanged) {
      setOrientation(targetOrientation);
    }
    setPendingOrientation(targetOrientation);

    setOrientationTip(ORIENTATION_PRESETS[targetOrientation].description);
    markCropReady();
    emitStepOneEvent({ type: 'substep', value: source === 'auto' ? 'complete' : 'crop' });
    setStage('complete');

    // Populate "Original Image" style with user's cropped photo immediately
    setPreviewState('original-image', {
      status: 'ready',
      data: {
        previewUrl: result.dataUrl,
        watermarkApplied: false,
        startedAt: Date.now(),
        completedAt: Date.now(),
      },
      orientation: targetOrientation,
    });

    // Auto-preview generation (disabled during testing to save API costs)
    if (shouldAutoGeneratePreviews()) {
      if (source === 'auto' || orientationChanged) {
        resetPreviews();
        await generatePreviews(undefined, { force: true });
      } else {
        console.log('[PhotoUploader] Manual crop saved without orientation change. Existing previews remain cached until you regenerate a style.');
      }
    } else {
      console.log('[PhotoUploader] Auto-preview generation disabled (testing mode). Click styles in Studio to generate.');
    }
  };

  const handleSmartCropReady = useCallback(
    (result: SmartCropResult) => {
      setSmartCropForOrientation(result.orientation, result);
      if (originalImage) {
        cacheSmartCropResult(originalImage, result.orientation, result);
      }
    },
    [originalImage, setSmartCropForOrientation]
  );

  const handleAcceptSmartCrop = async (result: SmartCropResult) => {
    await finalizeCrop(result, 'auto');
  };

  const handleCustomizeCrop = () => {
    if (!originalImage) return;
    setCropperOpen(true);
    setStage('cropper');
  };

  const handleOpenCropper = () => {
    if (!originalImage) return;
    setCropperOpen(true);
    setStage('cropper');
  };

  const handleCropComplete = async (result: SmartCropResult) => {
    await finalizeCrop(result, 'manual');
    setCropperOpen(false);
  };

  useEffect(() => {
    if (originalImage) {
      previousOriginalRef.current = originalImage;
    }
  }, [originalImage]);

  if (stage === 'analyzing' && originalImage) {
    return (
      <Card glass className="space-y-6 relative overflow-hidden">
        <AIAnalysisOverlay
          imageUrl={originalImage}
          onComplete={() => setStage('preview')}
        />
      </Card>
    );
  }

  if (stage === 'preview' && originalImage) {
    return (
      <Card glass className="space-y-6 relative overflow-hidden">
        <SmartCropPreview
          originalImage={originalImage}
          orientation={pendingOrientation}
          onAccept={handleAcceptSmartCrop}
          onAdjust={handleCustomizeCrop}
          onReady={handleSmartCropReady}
          onChangePhoto={handleSelectFile}
        />
      </Card>
    );
  }

  if (stage === 'cropper' && originalImage) {
    return (
      <CropperModal
        open={isCropperOpen}
        originalImage={originalImage}
        originalDimensions={originalImageDimensions}
        initialOrientation={orientation}
        smartCropCache={smartCrops}
        onClose={() => {
          setCropperOpen(false);
          if (croppedImage) {
            setStage('complete');
          } else {
            setStage('idle');
          }
        }}
        onComplete={handleCropComplete}
        onSmartCropReady={handleSmartCropReady}
      />
    );
  }

  return (
    <Card glass className="space-y-6 relative overflow-hidden">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <div
        className={clsx(
          'relative rounded-[1.75rem] border-2 border-dashed transition-all duration-300 overflow-hidden',
          isDragging
            ? 'border-purple-400 bg-gradient-upload-hover shadow-glow-purple'
            : 'border-white/20 bg-gradient-upload'
        )}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="absolute inset-0 bg-dropzone-radial opacity-60 pointer-events-none" />
        <div className="relative z-10 p-8 space-y-6">
          {!croppedImage ? (
            <>
              <div className="text-center space-y-3">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-glow-soft animate-pulseGlow">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white">
                  {isDragging ? 'Drop to Transform' : 'Start Your Masterpiece'}
                </h3>
                <p className="text-base text-white/80 max-w-md mx-auto">
                  Upload your favorite photo and watch it transform into stunning art in seconds
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleSelectFile}
                  className="flex-1 bg-gradient-cta text-white font-semibold px-6 py-4 rounded-xl shadow-glow-purple hover:shadow-glow-purple hover:scale-[1.02] transition-all duration-200"
                >
                  Upload Your Photo
                </button>
                <button
                  onClick={handleSamplePhoto}
                  className="flex-1 border-2 border-white/30 text-white font-medium px-6 py-4 rounded-xl hover:bg-white/10 hover:border-white/50 transition-all duration-200"
                >
                  Try a Sample
                </button>
              </div>
              <p className="text-xs text-center text-white/50">
                JPG or PNG • Max 10MB • Instant previews
              </p>
            </>
          ) : (
            <div className="space-y-4 animate-scaleIn">
              <div
                className="relative overflow-hidden border-2 border-white/20 bg-black/20 shadow-lg rounded-xl"
                style={{
                  aspectRatio: orientationMeta.ratio,
                  maxHeight: orientation === 'vertical' ? '75vh' : undefined
                }}
              >
                <img src={croppedImage} alt="Your photo" className="h-full w-full object-cover" />
                <div className="absolute top-3 right-3 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/80 backdrop-blur">
                  {orientationMeta.label}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSelectFile}
                  className="flex-1 bg-white/10 border border-white/20 text-white font-medium px-4 py-3 rounded-lg hover:bg-white/20 transition-all"
                >
                  Change Photo
                </button>
                <button
                  onClick={handleOpenCropper}
                  className="flex-1 bg-white/10 border border-white/20 text-white font-medium px-4 py-3 rounded-lg hover:bg-white/20 transition-all"
                >
                  Adjust Crop
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {orientationMessage && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-emerald-400/10 border border-emerald-400/20 animate-fadeIn">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-400">Perfect Orientation</p>
            <p className="text-xs text-white/70">{orientationMessage}</p>
          </div>
        </div>
      )}

      {croppedImage && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-400/20 animate-fadeIn">
          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-purple-400">Smart Crop Applied</p>
            <p className="text-xs text-white/70">{cropReadyLabel}</p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default PhotoUploader;
